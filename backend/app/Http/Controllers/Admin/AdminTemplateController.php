<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Template;
use App\Models\TemplateAsset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ZipArchive;

class AdminTemplateController extends Controller
{
    public function index()
    {
        return Template::with('categoryRelation')
            ->orderBy('id', 'asc')
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'category_id' => 'nullable|integer',
            'required_plan' => 'nullable|string|in:free,premium,vip,super-user,admin-only',

            'allow_free_initial_use' => 'sometimes|boolean',
            'free_initial_page_limit' => 'nullable|integer|min:0',
            'allow_individual_purchase' => 'sometimes|boolean',
            'individual_price_coins' => 'nullable|integer|min:0',
            'max_pages_by_plan' => 'nullable|integer|min:0',
            'max_pages_by_purchase' => 'nullable|integer|min:0',

            'access_duration_value' => 'nullable|integer|min:1',
            'access_duration_unit' => 'nullable|string|in:hours,days',
            'page_duration_value' => 'nullable|integer|min:1',
            'page_duration_unit' => 'nullable|string|in:hours,days',
            'admin_retention_days' => 'nullable|integer|min:0',

            'description' => 'nullable|string',
            'price_coins' => 'required|integer|min:0',
            'is_free' => 'boolean',
            'is_active' => 'boolean',
            'html_content' => 'nullable|string',
            'css_content' => 'nullable|string',
            'js_content' => 'nullable|string',
            'html_file' => 'nullable|file|mimes:html,txt',
            'fields_json' => 'required',
            'preview_image' => 'nullable|image|max:4096',
            'status' => 'nullable|string',

            'allow_upload_assets' => 'sometimes|boolean',
            'allow_external_assets' => 'sometimes|boolean',
            'use_default_assets' => 'sometimes|boolean',

            'max_upload_images' => 'nullable|integer|min:0',
            'max_upload_music' => 'nullable|integer|min:0',
            'max_upload_videos' => 'nullable|integer|min:0',
            'max_upload_audios' => 'nullable|integer|min:0',
            'max_upload_files' => 'nullable|integer|min:0',

            'max_external_images' => 'nullable|integer|min:0',
            'max_external_music' => 'nullable|integer|min:0',
            'max_external_videos' => 'nullable|integer|min:0',
            'max_external_audios' => 'nullable|integer|min:0',
            'max_external_files' => 'nullable|integer|min:0',
        ]);

        $htmlContent = $request->html_content;

        if ($request->hasFile('html_file')) {
            $htmlContent = file_get_contents(
                $request->file('html_file')->getRealPath()
            );
        }

        $previewPath = null;

        if ($request->hasFile('preview_image')) {
            $previewPath = $request
                ->file('preview_image')
                ->store('templates/previews', 'public');
        }

        $fields = is_string($request->fields_json)
            ? json_decode($request->fields_json, true)
            : $request->fields_json;

        if (! is_array($fields)) {
            return response()->json([
                'message' => 'fields_json no es válido.',
            ], 422);
        }

        $title = $request->title;
        $name = $request->name ?: $title;
        $slug = $request->slug ?: Str::slug($name);
        $requiredPlan = $request->required_plan ?: 'free';

        $template = Template::create([
            'name' => $name,
            'title' => $title,
            'slug' => $slug,
            'category' => $request->category,
            'category_id' => $request->category_id,
            'required_plan' => $requiredPlan,

            'allow_free_initial_use' => $request->boolean('allow_free_initial_use', true),
            'free_initial_page_limit' => $request->free_initial_page_limit ?? 2,
            'allow_individual_purchase' => $request->boolean('allow_individual_purchase', false),
            'individual_price_coins' => $request->individual_price_coins ?? 0,

            'description' => $request->description,
            'price_coins' => $request->price_coins,
            'is_free' => $request->boolean('is_free'),
            'is_active' => $request->boolean('is_active', true),
            'preview_image' => $previewPath,
            'html_content' => $htmlContent,
            'css_content' => $request->css_content,
            'js_content' => $request->js_content,
            'fields_json' => $fields,
            'status' => $request->status ?? 'active',

            'allow_upload_assets' => $request->boolean('allow_upload_assets', false),
            'allow_external_assets' => $request->boolean('allow_external_assets', false),
            'use_default_assets' => $request->boolean('use_default_assets', true),

            'max_upload_images' => $request->max_upload_images ?? 0,
            'max_upload_music' => $request->max_upload_music ?? 0,
            'max_upload_videos' => $request->max_upload_videos ?? 0,
            'max_upload_audios' => $request->max_upload_audios ?? 0,
            'max_upload_files' => $request->max_upload_files ?? 0,

            'max_external_images' => $request->max_external_images ?? 0,
            'max_external_music' => $request->max_external_music ?? 0,
            'max_external_videos' => $request->max_external_videos ?? 0,
            'max_external_audios' => $request->max_external_audios ?? 0,
            'max_external_files' => $request->max_external_files ?? 0,
            'max_pages_by_plan' => $request->max_pages_by_plan ?? 5,
            'max_pages_by_purchase' => $request->max_pages_by_purchase ?? 5,
            'access_duration_value' => $request->access_duration_value ?? 30,
            'access_duration_unit' => $request->access_duration_unit ?? 'days',
            'page_duration_value' => $request->page_duration_value ?? 30,
            'page_duration_unit' => $request->page_duration_unit ?? 'days',
            'admin_retention_days' => $request->admin_retention_days ?? 3,

        ]);

        return response()->json([
            'message' => 'Plantilla creada correctamente.',
            'template' => $template,
        ], 201);
    }

    public function importZip(Request $request)
    {
        $request->validate([
            'zip_file' => 'required|file|mimes:zip|max:20480',
            'title' => 'required|string|max:255',
            'name' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'category_id' => 'nullable|integer',
            'required_plan' => 'nullable|string|in:free,premium,vip,super-user,admin-only',

            'allow_free_initial_use' => 'sometimes|boolean',
            'free_initial_page_limit' => 'nullable|integer|min:0',
            'allow_individual_purchase' => 'sometimes|boolean',
            'individual_price_coins' => 'nullable|integer|min:0',

            'max_pages_by_plan' => 'nullable|integer|min:1',
            'max_pages_by_purchase' => 'nullable|integer|min:1',

            'access_duration_value' => 'nullable|integer|min:1',
            'access_duration_unit' => 'nullable|string|in:hours,days',
            'page_duration_value' => 'nullable|integer|min:1',
            'page_duration_unit' => 'nullable|string|in:hours,days',
            'admin_retention_days' => 'nullable|integer|min:0',

            'description' => 'nullable|string',
            'price_coins' => 'nullable|integer|min:0',
            'is_free' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',

            'allow_upload_assets' => 'sometimes|boolean',
            'allow_external_assets' => 'sometimes|boolean',
            'use_default_assets' => 'sometimes|boolean',

            'max_upload_images' => 'nullable|integer|min:0',
            'max_upload_music' => 'nullable|integer|min:0',
            'max_upload_videos' => 'nullable|integer|min:0',
            'max_upload_audios' => 'nullable|integer|min:0',
            'max_upload_files' => 'nullable|integer|min:0',

            'max_external_images' => 'nullable|integer|min:0',
            'max_external_music' => 'nullable|integer|min:0',
            'max_external_videos' => 'nullable|integer|min:0',
            'max_external_audios' => 'nullable|integer|min:0',
            'max_external_files' => 'nullable|integer|min:0',
        ]);

        $zip = new ZipArchive;

        if ($zip->open($request->file('zip_file')->getRealPath()) !== true) {
            return response()->json([
                'message' => 'No se pudo abrir el archivo ZIP.',
            ], 422);
        }

        $folderName = 'template_'.time().'_'.Str::random(8);
        $extractPath = storage_path('app/tmp/'.$folderName);

        File::ensureDirectoryExists($extractPath);

        $zip->extractTo($extractPath);
        $zip->close();

        $indexPath = $extractPath.'/index.html';
        $cssPath = $extractPath.'/css/style.css';
        $jsPath = $extractPath.'/js/app.js';
        $jsonPath = $extractPath.'/template.json';

        if (! File::exists($indexPath)) {
            File::deleteDirectory($extractPath);

            return response()->json([
                'message' => 'El ZIP debe contener index.html.',
            ], 422);
        }

        $htmlContent = File::get($indexPath);
        $cssContent = File::exists($cssPath) ? File::get($cssPath) : null;
        $jsContent = File::exists($jsPath) ? File::get($jsPath) : null;

        $fields = [];

        if (File::exists($jsonPath)) {
            $json = json_decode(File::get($jsonPath), true);

            if (is_array($json)) {
                foreach ($json as $key => $value) {
                    $lowerKey = strtolower($key);
                    $type = 'text';

                    if (
                        str_contains($lowerKey, 'musica') ||
                        str_contains($lowerKey, 'audio') ||
                        str_contains($lowerKey, 'song')
                    ) {
                        $type = 'url';
                    } elseif (
                        str_contains($lowerKey, 'foto') ||
                        str_contains($lowerKey, 'imagen') ||
                        str_contains($lowerKey, 'image')
                    ) {
                        $type = 'image';
                    } elseif (strlen((string) $value) > 80) {
                        $type = 'textarea';
                    }

                    $fields[] = [
                        'name' => $key,
                        'label' => Str::headline($key),
                        'type' => $type,
                        'default' => $value,
                    ];
                }
            }
        }

        preg_match_all('/{{\s*([a-zA-Z0-9_]+)\s*}}/', $htmlContent, $matches);

        foreach ($matches[1] ?? [] as $variable) {
            $exists = collect($fields)->contains('name', $variable);

            if (! $exists) {
                $fields[] = [
                    'name' => $variable,
                    'label' => Str::headline($variable),
                    'type' => 'text',
                    'default' => '',
                ];
            }
        }

        $title = $request->title;
        $name = $request->name ?: $title;
        $slug = $request->slug ?: Str::slug($name);
        $requiredPlan = $request->required_plan ?: 'free';

        $template = Template::create([
            'name' => $name,
            'title' => $title,
            'slug' => $slug,
            'category' => $request->category,
            'category_id' => $request->category_id,
            'required_plan' => $requiredPlan,

            'allow_free_initial_use' => $request->boolean('allow_free_initial_use', true),
            'free_initial_page_limit' => $request->free_initial_page_limit ?? 2,
            'allow_individual_purchase' => $request->boolean('allow_individual_purchase', false),
            'individual_price_coins' => $request->individual_price_coins ?? 0,

            'description' => $request->description,
            'price_coins' => $request->price_coins ?? 0,

            'max_pages_by_plan' => $request->max_pages_by_plan ?? 5,
            'max_pages_by_purchase' => $request->max_pages_by_purchase ?? 5,

            'is_free' => $request->boolean('is_free'),
            'is_active' => $request->boolean('is_active', true),
            'html_content' => $htmlContent,
            'css_content' => $cssContent,
            'js_content' => $jsContent,
            'fields_json' => $fields,
            'status' => 'active',

            'allow_upload_assets' => $request->boolean('allow_upload_assets', false),
            'allow_external_assets' => $request->boolean('allow_external_assets', false),
            'use_default_assets' => $request->boolean('use_default_assets', true),

            'max_upload_images' => $request->max_upload_images ?? 0,
            'max_upload_music' => $request->max_upload_music ?? 0,
            'max_upload_videos' => $request->max_upload_videos ?? 0,
            'max_upload_audios' => $request->max_upload_audios ?? 0,
            'max_upload_files' => $request->max_upload_files ?? 0,

            'max_external_images' => $request->max_external_images ?? 0,
            'max_external_music' => $request->max_external_music ?? 0,
            'max_external_videos' => $request->max_external_videos ?? 0,
            'max_external_audios' => $request->max_external_audios ?? 0,
            'max_external_files' => $request->max_external_files ?? 0,

            'access_duration_value' => $request->access_duration_value ?? 30,
            'access_duration_unit' => $request->access_duration_unit ?? 'days',
            'page_duration_value' => $request->page_duration_value ?? 30,
            'page_duration_unit' => $request->page_duration_unit ?? 'days',
            'admin_retention_days' => $request->admin_retention_days ?? 3,
        ]);

        $assetsPath = $extractPath.'/assets';

        if (File::exists($assetsPath)) {
            $files = File::files($assetsPath);

            foreach ($files as $file) {
                $path = Storage::disk('public')->putFile(
                    'templates/assets/'.$template->id,
                    $file
                );

                if (class_exists(TemplateAsset::class)) {
                    TemplateAsset::create([
                        'template_id' => $template->id,
                        'asset_type' => $file->getExtension(),
                        'file_path' => $path,
                        'file_name' => $file->getFilename(),
                    ]);
                }
            }
        }

        File::deleteDirectory($extractPath);

        return response()->json([
            'message' => 'Plantilla ZIP importada correctamente.',
            'template' => $template,
        ], 201);
    }

    public function show(Template $template)
    {
        return $template->load('categoryRelation');
    }

    public function update(Request $request, Template $template)
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'title' => 'sometimes|string|max:255',
            'slug' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'category_id' => 'nullable|integer',
            'required_plan' => 'nullable|string|in:free,premium,vip,super-user,admin-only',

            'allow_free_initial_use' => 'sometimes|boolean',
            'free_initial_page_limit' => 'nullable|integer|min:0',
            'allow_individual_purchase' => 'sometimes|boolean',
            'individual_price_coins' => 'nullable|integer|min:0',
            'max_pages_by_plan' => 'nullable|integer|min:1',
            'max_pages_by_purchase' => 'nullable|integer|min:1',

            'access_duration_value' => 'nullable|integer|min:1',
            'access_duration_unit' => 'nullable|string|in:hours,days',
            'page_duration_value' => 'nullable|integer|min:1',
            'page_duration_unit' => 'nullable|string|in:hours,days',
            'admin_retention_days' => 'nullable|integer|min:0',

            'description' => 'nullable|string',
            'price_coins' => 'sometimes|integer|min:0',
            'is_free' => 'boolean',
            'is_active' => 'boolean',
            'html_content' => 'nullable|string',
            'css_content' => 'nullable|string',
            'js_content' => 'nullable|string',
            'html_file' => 'nullable|file|mimes:html,txt',
            'fields_json' => 'nullable',
            'preview_image' => 'nullable|image|max:4096',
            'status' => 'nullable|string',

            'allow_upload_assets' => 'sometimes|boolean',
            'allow_external_assets' => 'sometimes|boolean',
            'use_default_assets' => 'sometimes|boolean',

            'max_upload_images' => 'nullable|integer|min:0',
            'max_upload_music' => 'nullable|integer|min:0',
            'max_upload_videos' => 'nullable|integer|min:0',
            'max_upload_audios' => 'nullable|integer|min:0',
            'max_upload_files' => 'nullable|integer|min:0',

            'max_external_images' => 'nullable|integer|min:0',
            'max_external_music' => 'nullable|integer|min:0',
            'max_external_videos' => 'nullable|integer|min:0',
            'max_external_audios' => 'nullable|integer|min:0',
            'max_external_files' => 'nullable|integer|min:0',
        ]);

        $data = $request->only([
            'name',
            'title',
            'slug',
            'category',
            'category_id',
            'required_plan',

            'free_initial_page_limit',
            'individual_price_coins',
            'max_pages_by_plan',
            'max_pages_by_purchase',

            'description',
            'price_coins',
            'status',
            'css_content',
            'js_content',

            'allow_upload_assets',
            'allow_external_assets',
            'use_default_assets',

            'max_upload_images',
            'max_upload_music',
            'max_upload_videos',
            'max_upload_audios',
            'max_upload_files',

            'max_external_images',
            'max_external_music',
            'max_external_videos',
            'max_external_audios',
            'max_external_files',
            'max_pages_by_plan',
            'max_pages_by_purchase',
            'access_duration_value',
            'access_duration_unit',
            'page_duration_value',
            'page_duration_unit',
            'admin_retention_days',
        ]);

        if ($request->has('is_free')) {
            $data['is_free'] = $request->boolean('is_free');
        }

        if ($request->has('is_active')) {
            $data['is_active'] = $request->boolean('is_active');
        }

        if ($request->has('allow_upload_assets')) {
            $data['allow_upload_assets'] = $request->boolean('allow_upload_assets');
        }

        if ($request->has('allow_external_assets')) {
            $data['allow_external_assets'] = $request->boolean('allow_external_assets');
        }

        if ($request->has('use_default_assets')) {
            $data['use_default_assets'] = $request->boolean('use_default_assets');
        }

        if ($request->has('allow_free_initial_use')) {
            $data['allow_free_initial_use'] = $request->boolean('allow_free_initial_use');
        }

        if ($request->has('allow_individual_purchase')) {
            $data['allow_individual_purchase'] = $request->boolean('allow_individual_purchase');
        }

        if ($request->has('html_content')) {
            $data['html_content'] = $request->html_content;
        }

        if ($request->hasFile('html_file')) {
            $data['html_content'] = file_get_contents(
                $request->file('html_file')->getRealPath()
            );
        }

        if ($request->hasFile('preview_image')) {
            if ($template->preview_image) {
                Storage::disk('public')->delete($template->preview_image);
            }

            $data['preview_image'] = $request
                ->file('preview_image')
                ->store('templates/previews', 'public');
        }

        if ($request->has('fields_json')) {
            $fields = is_string($request->fields_json)
                ? json_decode($request->fields_json, true)
                : $request->fields_json;

            if (! is_array($fields)) {
                return response()->json([
                    'message' => 'fields_json no es válido.',
                ], 422);
            }

            $data['fields_json'] = $fields;
        }

        $template->update($data);

        return response()->json([
            'message' => 'Plantilla actualizada correctamente.',
            'template' => $template->fresh('categoryRelation'),
        ]);
    }

    public function destroy(Template $template)
    {
    if ($template->preview_image) {
        Storage::disk('public')->delete($template->preview_image);
        }

    Storage::disk('public')->deleteDirectory(
        'imported-templates/' . $template->id
    );

    Storage::disk('public')->deleteDirectory(
        'templates/assets/' . $template->id
        );

    $template->delete();

    return response()->json([
        'message' => 'Plantilla eliminada correctamente.',
        ]);
    }
}
