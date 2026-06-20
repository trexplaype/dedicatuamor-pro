<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTemplateZipImportRequest;
use App\Models\Template;
use App\Models\TemplateAsset;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ZipArchive;

class AdminTemplateZipImportController extends Controller
{
    public function store(StoreTemplateZipImportRequest $request)
    {
        $zipFile = $request->file('zip_file');

        $importId = Str::uuid()->toString();
        $extractPath = storage_path("app/imports/{$importId}");

        File::ensureDirectoryExists($extractPath);

        $zip = new ZipArchive;

        if ($zip->open($zipFile->getRealPath()) !== true) {
            return response()->json([
                'message' => 'No se pudo abrir el archivo ZIP.',
            ], 422);
        }

        $zip->extractTo($extractPath);
        $zip->close();

        $rootPath = $this->detectRootPath($extractPath);

        $htmlPath = $this->findFirstExistingFile($rootPath, [
            'index.html',
            'Index.html',
        ]);

        $jsonPath = $this->findFirstExistingFile($rootPath, [
            'template.json',
            'Template.json',
        ]);

        $cssPath = $this->findFirstExistingFile($rootPath, [
            'style.css',
            'css/style.css',
            'styles/style.css',
        ]);

        $jsPath = $this->findFirstExistingFile($rootPath, [
            'app.js',
            'js/app.js',
            'script.js',
            'js/script.js',
        ]);

        if (! $htmlPath || ! $jsonPath) {
            File::deleteDirectory($extractPath);

            return response()->json([
                'message' => 'El ZIP debe contener index.html y template.json.',
            ], 422);
        }

        $config = json_decode(File::get($jsonPath), true);

        if (! is_array($config)) {
            File::deleteDirectory($extractPath);

            return response()->json([
                'message' => 'template.json no tiene un formato JSON válido.',
            ], 422);
        }

        $name = $request->input('name') ?: ($config['name'] ?? $config['title'] ?? 'Plantilla sin nombre');
        $title = $request->input('title') ?: ($config['title'] ?? $name);
        $slug = Str::slug($request->input('slug') ?: ($config['slug'] ?? $name));

        $originalSlug = $slug;
        $counter = 1;

        while (Template::where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$counter;
            $counter++;
        }

        $accessPlans = $this->normalizeAccessPlans($request->input('access_plans'));

        $template = Template::create([
            'name' => $name,
            'slug' => $slug,
            'title' => $title,
            'description' => $request->input('description') ?: ($config['description'] ?? 'Plantilla importada desde ZIP.'),
            'category' => $request->input('category') ?: ($config['category'] ?? 'amor'),
            'category_id' => $request->input('category_id') ?: ($config['category_id'] ?? null),
            'required_plan' => $request->input('required_plan') ?: ($config['required_plan'] ?? 'free'),
            'access_plans' => $accessPlans,
            'price_coins' => (int) $request->input('price_coins', $config['price_coins'] ?? 50),
            'discount_coins' => $request->filled('discount_coins')
                ? (int) $request->input('discount_coins')
                : ($config['discount_coins'] ?? null),
            'is_free' => $request->boolean('is_free', $config['is_free'] ?? false),
            'is_active' => $request->boolean('is_active', $config['is_active'] ?? true),
            'status' => $config['status'] ?? 'active',
            'html_content' => File::get($htmlPath),
            'css_content' => $cssPath ? File::get($cssPath) : '',
            'js_content' => $jsPath ? File::get($jsPath) : '',
            'fields_json' => $this->normalizeFields($config),
            'access_duration_value' => $request->input('access_duration_value') ?? ($config['access_duration_value'] ?? 30),
            'access_duration_unit' => $request->input('access_duration_unit') ?? ($config['access_duration_unit'] ?? 'days'),
            'page_duration_value' => $request->input('page_duration_value') ?? ($config['page_duration_value'] ?? 30),
            'page_duration_unit' => $request->input('page_duration_unit') ?? ($config['page_duration_unit'] ?? 'days'),
            'admin_retention_days' => $request->input('admin_retention_days') ?? ($config['admin_retention_days'] ?? 3),
        ]);

        $publicBasePath = "imported-templates/{$template->id}";
        $publicFullPath = storage_path("app/public/{$publicBasePath}");

        File::ensureDirectoryExists($publicFullPath);
        File::copyDirectory($rootPath, $publicFullPath);

        $this->generatePreviewHtml($publicFullPath);
        $this->injectEditorBridge($publicFullPath);

        $sourceZipPath = "imported-templates/{$template->id}/source.zip";

        Storage::disk('public')->put(
            $sourceZipPath,
            File::get($zipFile->getRealPath())
        );

        $previewRelativePath = $this->relativePublicFilePath($publicFullPath, [
            'preview.html',
            'Preview.html',
        ]);

        $editorRelativePath = $this->relativePublicFilePath($publicFullPath, [
            'editor.html',
            'Editor.html',
        ]);

        $viewRelativePath = $this->relativePublicFilePath($publicFullPath, [
            'index.html',
            'Index.html',
        ]);

        $template->update([
            'preview_url' => $previewRelativePath
                ? Storage::url("{$publicBasePath}/{$previewRelativePath}")
                : null,
            'editor_url' => $editorRelativePath
                ? Storage::url("{$publicBasePath}/{$editorRelativePath}")
                : null,
            'view_url' => $viewRelativePath
                ? Storage::url("{$publicBasePath}/{$viewRelativePath}")
                : null,

            'source_zip_path' => $sourceZipPath,
            'preview_image' => $this->detectPreviewImageUrl($publicFullPath, $publicBasePath),
        ]);

        $assetsImported = $this->importAssets($template, $rootPath);

        File::deleteDirectory($extractPath);

        return response()->json([
            'message' => 'Plantilla importada correctamente.',
            'template' => $template->fresh('assets'),
            'assets_imported' => $assetsImported,
        ], 201);
    }

    private function generatePreviewHtml(string $publicFullPath): void
    {
        $indexFile = $this->findFirstExistingFile($publicFullPath, [
            'index.html',
            'Index.html',
        ]);

        if (! $indexFile) {
            return;
        }

        $html = File::get($indexFile);

        $previewScript = <<<'HTML'
<script>
(function () {
    function clickStartButton() {
        const selectors = [
            '#startButton',
            '#start-button',
            '#startExperience',
            '#start-experience',
            '.start-button',
            '.startButton',
            '.start-experience',
            '.startExperience',
            '[data-start]',
            '[data-action="start"]',
            'button',
            'a'
        ];

        let elements = [];

        selectors.forEach(function (selector) {
            document.querySelectorAll(selector).forEach(function (element) {
                elements.push(element);
            });
        });

        elements = [...new Set(elements)];

        const startElement = elements.find(function (element) {
            const text = (element.innerText || element.textContent || '').toLowerCase().trim();

            return (
                text.includes('iniciar') ||
                text.includes('comenzar') ||
                text.includes('empezar') ||
                text.includes('entrar') ||
                text.includes('experiencia') ||
                text.includes('start') ||
                text.includes('begin') ||
                text.includes('open')
            );
        });

        if (startElement) {
            startElement.click();
            return true;
        }

        return false;
    }

    function forcePreviewLayout() {
        document.documentElement.style.width = '100%';
        document.documentElement.style.height = '100%';
        document.documentElement.style.overflow = 'hidden';

        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';

        const style = document.createElement('style');
        style.innerHTML = `
            html,
            body {
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                overflow: hidden !important;
                background: #05000f !important;
            }

            canvas,
            video,
            iframe,
            .scene,
            .galaxy,
            .universe,
            .stars,
            .experience,
            #scene,
            #galaxy,
            #universe,
            #stars,
            #experience {
                max-width: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    function muteAllMedia() {
    document.querySelectorAll('audio').forEach(function(audio) {
        audio.muted = true;
        audio.volume = 0;

        try {
            audio.pause();
        } catch (e) {}
    });

    document.querySelectorAll('video').forEach(function(video) {
        video.muted = true;
        video.volume = 0;

        try {
            video.pause();
        } catch (e) {}
    });
}

window.addEventListener('load', function () {

    forcePreviewLayout();

    muteAllMedia();

    setInterval(function () {
        muteAllMedia();
    }, 1000);

    let tries = 0;

    const interval = setInterval(function () {
        tries++;

        const clicked = clickStartButton();

        if (clicked || tries >= 20) {
            clearInterval(interval);
        }
    }, 500);
});
})();
</script>
HTML;

        if (str_contains($html, '</body>')) {
            $html = str_replace('</body>', $previewScript.'</body>', $html);
        } elseif (str_contains($html, '</BODY>')) {
            $html = str_replace('</BODY>', $previewScript.'</BODY>', $html);
        } else {
            $html .= $previewScript;
        }

        File::put(
            dirname($indexFile).DIRECTORY_SEPARATOR.'preview.html',
            $html
        );
    }

    private function injectEditorBridge(string $publicFullPath): void
{
    $editorFile = $this->findFirstExistingFile($publicFullPath, [
        'editor.html',
        'Editor.html',
    ]);

    if (! $editorFile) {
        return;
    }

    $html = File::get($editorFile);

    if (str_contains($html, 'dedicatuamor-editor-bridge.js')) {
        return;
    }

    $bridgeScript = <<<'HTML'
    <script src="/js/dedicatuamor-editor-bridge.js"></script>
    HTML;

    if (str_contains($html, '</body>')) {
        $html = str_replace('</body>', $bridgeScript.'</body>', $html);
    } elseif (str_contains($html, '</BODY>')) {
        $html = str_replace('</BODY>', $bridgeScript.'</BODY>', $html);
    } else {
        $html .= $bridgeScript;
    }

    File::put($editorFile, $html);
    }

    private function normalizeAccessPlans($value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);

            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return ['free'];
    }

    private function detectRootPath(string $extractPath): string
    {
        if (
            File::exists($extractPath.DIRECTORY_SEPARATOR.'index.html') ||
            File::exists($extractPath.DIRECTORY_SEPARATOR.'template.json')
        ) {
            return $extractPath;
        }

        $directories = File::directories($extractPath);

        if (count($directories) === 1) {
            return $directories[0];
        }

        foreach ($directories as $directory) {
            if (
                File::exists($directory.DIRECTORY_SEPARATOR.'index.html') ||
                File::exists($directory.DIRECTORY_SEPARATOR.'template.json')
            ) {
                return $directory;
            }
        }

        return $extractPath;
    }

    private function findFirstExistingFile(string $rootPath, array $paths): ?string
    {
        foreach ($paths as $path) {
            $fullPath = $rootPath.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $path);

            if (File::exists($fullPath)) {
                return $fullPath;
            }
        }

        return null;
    }

    private function normalizeFields(array $config): array
    {
        if (isset($config['fields']) && is_array($config['fields'])) {
            return $config['fields'];
        }

        $ignoredKeys = [
            'name',
            'slug',
            'title',
            'description',
            'category',
            'category_id',
            'required_plan',
            'access_plans',
            'price_coins',
            'discount_coins',
            'is_free',
            'is_active',
            'status',
        ];

        $fields = [];

        foreach ($config as $key => $value) {
            if (in_array($key, $ignoredKeys, true)) {
                continue;
            }

            if (is_array($value) || is_object($value)) {
                continue;
            }

            $fields[] = [
                'name' => $key,
                'label' => Str::headline($key),
                'type' => $this->guessFieldType($key, $value),
                'default' => $value,
            ];
        }

        return $fields;
    }

    private function guessFieldType(string $key, mixed $value): string
    {
        $key = strtolower($key);
        $value = strtolower((string) $value);

        if (Str::contains($key, ['musica', 'audio', 'song']) || Str::endsWith($value, ['.mp3', '.wav', '.ogg', '.m4a'])) {
            return 'audio';
        }

        if (Str::contains($key, ['video']) || Str::endsWith($value, ['.mp4', '.webm', '.mov'])) {
            return 'video';
        }

        if (Str::contains($key, ['imagen', 'foto', 'image', 'photo']) || Str::endsWith($value, ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'])) {
            return 'image';
        }

        if (Str::contains($key, ['color'])) {
            return 'color';
        }

        if (Str::contains($key, ['fecha', 'date'])) {
            return 'date';
        }

        if (Str::contains($key, ['url', 'link', 'enlace'])) {
            return 'url';
        }

        if (strlen((string) $value) > 120) {
            return 'textarea';
        }

        return 'text';
    }

    private function relativePublicFilePath(string $publicFullPath, array $fileNames): ?string
    {
        $files = File::allFiles($publicFullPath);

        foreach ($files as $file) {
            foreach ($fileNames as $fileName) {
                if (strtolower($file->getFilename()) === strtolower($fileName)) {
                    return str_replace('\\', '/', $file->getRelativePathname());
                }
            }
        }

        return null;
    }

    private function detectPreviewImageUrl(string $publicFullPath, string $publicBasePath): ?string
    {
        $files = File::allFiles($publicFullPath);

        foreach ($files as $file) {
            $extension = strtolower($file->getExtension());

            if (in_array($extension, ['jpg', 'jpeg', 'png', 'webp'], true)) {
                return Storage::url(
                    $publicBasePath.'/'.str_replace('\\', '/', $file->getRelativePathname())
                );
            }
        }

        return null;
    }

    private function importAssets(Template $template, string $rootPath): int
    {
        $assetsPath = $rootPath.DIRECTORY_SEPARATOR.'assets';

        if (! File::exists($assetsPath)) {
            return 0;
        }

        $files = File::allFiles($assetsPath);
        $assetsImported = 0;

        foreach ($files as $index => $file) {
            $extension = strtolower($file->getExtension());
            $type = $this->detectType($extension);

            $relativePath = str_replace('\\', '/', $file->getRelativePathname());
            $storedPath = "imported-templates/{$template->id}/assets/{$relativePath}";

            TemplateAsset::create([
                'template_id' => $template->id,
                'type' => $type,
                'source_type' => 'zip',
                'name' => $file->getFilename(),
                'url' => Storage::url($storedPath),
                'file_path' => $storedPath,
                'sort_order' => $index + 1,
                'is_active' => true,
            ]);

            $assetsImported++;
        }

        return $assetsImported;
    }

    private function detectType(string $extension): string
    {
        return match ($extension) {
            'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg' => 'image',
            'mp3', 'wav', 'ogg', 'm4a' => 'audio',
            'mp4', 'webm', 'mov' => 'video',
            default => 'image',
        };
    }
}
