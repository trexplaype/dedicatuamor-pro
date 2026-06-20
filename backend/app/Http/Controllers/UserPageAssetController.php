<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\UserPage;
use App\Models\UserPageAsset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserPageAssetController extends Controller
{
    public function index(Request $request, UserPage $page)
    {
        $this->authorizePage($request, $page);

        return UserPageAsset::where('user_page_id', $page->id)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->latest()
            ->get();
    }

    public function store(Request $request, UserPage $page)
    {
        $this->authorizePage($request, $page);

        if ($response = $this->validatePageNotExpired($page)) {
            return $response;
        }

        $data = $this->validateAssetRequest($request);
        $rules = $this->resolveAssetRules($request->user(), $page);

        if ($response = $this->validateAssetPermissions($data, $rules)) {
            return $response;
        }

        if ($response = $this->validateAssetSource($request, $data)) {
            return $response;
        }

        if (
            $data['source_type'] === 'upload' &&
            in_array($data['type'], ['music', 'audio', 'video'])
        ) {
            $this->replaceSingleAsset($page, $data['type']);
        }

        if ($response = $this->validateAssetLimit($page, $data, $rules)) {
            return $response;
        }

        $fileData = $this->storeUploadedFile($request, $page, $data);

        $asset = $this->createAsset($request, $page, $data, $fileData);

        $publicUrl = $asset->source_type === 'upload' && $asset->file_path
            ? url(Storage::url($asset->file_path))
            : $asset->url;

        return response()->json([
            'message' => 'Asset guardado correctamente.',
            'asset' => $asset,
            'url' => $publicUrl,
            'rules_source' => $rules['source'],
        ], 201);
    }

    public function destroy(Request $request, UserPageAsset $asset)
    {
        $page = $asset->page;

        if (! $page || $page->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'No autorizado.',
            ], 403);
        }

        $this->deleteStoredFile($asset);

        $asset->delete();

        return response()->json([
            'message' => 'Asset eliminado correctamente.',
        ]);
    }

    private function validatePageNotExpired(UserPage $page)
    {
        if ($page->expires_at && now()->greaterThan($page->expires_at)) {
            return response()->json([
                'message' => 'Esta página ya expiró.',
                'code' => 'PAGE_EXPIRED',
            ], 400);
        }

        return null;
    }

    private function validateAssetRequest(Request $request): array
    {
        return $request->validate([
            'type' => ['required', Rule::in(['image', 'video', 'audio', 'music', 'file'])],
            'source_type' => ['required', Rule::in(['url', 'upload'])],
            'title' => ['nullable', 'string', 'max:255'],
            'url' => ['nullable', 'url', 'max:5000'],
            'file' => ['nullable', 'file', 'max:51200'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);
    }

    private function validateAssetPermissions(array $data, array $rules)
    {
        if ($data['source_type'] === 'upload' && ! $rules['allow_upload_assets']) {
            return response()->json([
                'message' => 'Tu plan no permite subir archivos.',
                'code' => 'UPLOAD_NOT_ALLOWED',
            ], 403);
        }

        if ($data['source_type'] === 'url' && ! $rules['allow_external_assets']) {
            return response()->json([
                'message' => 'Tu plan no permite usar URLs externas.',
                'code' => 'EXTERNAL_URL_NOT_ALLOWED',
            ], 403);
        }

        return null;
    }

    private function validateAssetSource(Request $request, array $data)
    {
        if ($data['source_type'] === 'upload' && ! $request->hasFile('file')) {
            return response()->json([
                'message' => 'Debes subir un archivo.',
                'code' => 'FILE_REQUIRED',
            ], 422);
        }

        if ($data['source_type'] === 'url' && empty($data['url'])) {
            return response()->json([
                'message' => 'Debes enviar una URL válida.',
                'code' => 'URL_REQUIRED',
            ], 422);
        }

        return null;
    }

    private function validateAssetLimit(UserPage $page, array $data, array $rules)
    {
        $limitKey = $this->limitKey($data['source_type'], $data['type']);
        $limit = (int) ($rules[$limitKey] ?? 0);
        $currentCount = $this->countCurrentAssets($page, $data);

        if ($limit <= 0 || $currentCount >= $limit) {
            return response()->json([
                'message' => 'Alcanzaste el límite permitido para este tipo de archivo.',
                'code' => 'ASSET_LIMIT_REACHED',
                'limit' => $limit,
                'used' => $currentCount,
                'type' => $data['type'],
                'source_type' => $data['source_type'],
            ], 400);
        }

        return null;
    }

    private function storeUploadedFile(Request $request, UserPage $page, array $data): array
    {
        if ($data['source_type'] !== 'upload') {
            return [
                'file_path' => null,
                'file_name' => null,
                'mime_type' => null,
                'file_size' => null,
            ];
        }

        $file = $request->file('file');

        return [
            'file_path' => $file->store("user-pages/{$page->id}/assets", 'public'),
            'file_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
        ];
    }

    private function createAsset(Request $request, UserPage $page, array $data, array $fileData): UserPageAsset
    {
        return UserPageAsset::create([
            'user_id' => $request->user()->id,
            'user_page_id' => $page->id,
            'type' => $data['type'],
            'source_type' => $data['source_type'],
            'title' => $data['title'] ?? null,
            'url' => $data['source_type'] === 'url' ? $data['url'] : null,
            'file_path' => $fileData['file_path'],
            'file_name' => $fileData['file_name'],
            'mime_type' => $fileData['mime_type'],
            'file_size' => $fileData['file_size'],
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => true,
        ]);
    }

    private function deleteStoredFile(UserPageAsset $asset): void
    {
        if ($asset->file_path && Storage::disk('public')->exists($asset->file_path)) {
            Storage::disk('public')->delete($asset->file_path);
        }
    }

    private function countCurrentAssets(UserPage $page, array $data): int
    {
        return UserPageAsset::where('user_page_id', $page->id)
            ->where('source_type', $data['source_type'])
            ->where('type', $data['type'])
            ->where('is_active', true)
            ->count();
    }

    private function authorizePage(Request $request, UserPage $page): void
    {
        abort_if($page->user_id !== $request->user()->id, 403, 'No autorizado.');
    }

    private function resolveAssetRules($user, UserPage $page): array
    {
        $template = $page->template;

        if (($user->role ?? null) === 'admin') {
            return $this->adminRules();
        }

        if ($page->user_template_id) {
            return $this->templateRules($template, 'template_purchase');
        }

        $subscription = $this->activeSubscription($user->id);

        if ($subscription) {
            $plan = Plan::find($subscription->plan_id);

            return $this->planRules($plan, 'subscription');
        }

        $freePlan = Plan::where('access_level', 'free')
            ->where('is_active', true)
            ->first();

        return $this->planRules($freePlan, 'free');
    }

    private function activeSubscription(int $userId): ?Subscription
    {
        return Subscription::where('user_id', $userId)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->latest()
            ->first();
    }

    private function planRules(?Plan $plan, string $source): array
    {
        return [
            'source' => $source,

            'allow_upload_assets' => (bool) ($plan->allow_upload_assets ?? false),
            'allow_external_assets' => (bool) ($plan->allow_external_assets ?? false),
            'use_default_assets' => (bool) ($plan->use_default_assets ?? true),

            'max_upload_images' => (int) ($plan->max_upload_images ?? 0),
            'max_upload_music' => (int) ($plan->max_upload_music ?? 0),
            'max_upload_videos' => (int) ($plan->max_upload_videos ?? 0),
            'max_upload_audios' => (int) ($plan->max_upload_audios ?? 0),
            'max_upload_files' => (int) ($plan->max_upload_files ?? 0),

            'max_external_images' => (int) ($plan->max_external_images ?? 0),
            'max_external_music' => (int) ($plan->max_external_music ?? 0),
            'max_external_videos' => (int) ($plan->max_external_videos ?? 0),
            'max_external_audios' => (int) ($plan->max_external_audios ?? 0),
            'max_external_files' => (int) ($plan->max_external_files ?? 0),
        ];
    }

    private function templateRules($template, string $source): array
    {
        return [
            'source' => $source,

            'allow_upload_assets' => (bool) ($template->allow_upload_assets ?? false),
            'allow_external_assets' => (bool) ($template->allow_external_assets ?? false),
            'use_default_assets' => (bool) ($template->use_default_assets ?? true),

            'max_upload_images' => (int) ($template->max_upload_images ?? 0),
            'max_upload_music' => (int) ($template->max_upload_music ?? 0),
            'max_upload_videos' => (int) ($template->max_upload_videos ?? 0),
            'max_upload_audios' => (int) ($template->max_upload_audios ?? 0),
            'max_upload_files' => (int) ($template->max_upload_files ?? 0),

            'max_external_images' => (int) ($template->max_external_images ?? 0),
            'max_external_music' => (int) ($template->max_external_music ?? 0),
            'max_external_videos' => (int) ($template->max_external_videos ?? 0),
            'max_external_audios' => (int) ($template->max_external_audios ?? 0),
            'max_external_files' => (int) ($template->max_external_files ?? 0),
        ];
    }

    private function adminRules(): array
    {
        return [
            'source' => 'admin',

            'allow_upload_assets' => true,
            'allow_external_assets' => true,
            'use_default_assets' => true,

            'max_upload_images' => 999999,
            'max_upload_music' => 999999,
            'max_upload_videos' => 999999,
            'max_upload_audios' => 999999,
            'max_upload_files' => 999999,

            'max_external_images' => 999999,
            'max_external_music' => 999999,
            'max_external_videos' => 999999,
            'max_external_audios' => 999999,
            'max_external_files' => 999999,
        ];
    }

    private function replaceSingleAsset(UserPage $page, string $type): void
    {
        $oldAssets = UserPageAsset::where('user_page_id', $page->id)
            ->where('type', $type)
            ->where('source_type', 'upload')
            ->where('is_active', true)
            ->get();

        foreach ($oldAssets as $asset) {
            $this->deleteStoredFile($asset);
            $asset->delete();
        }
    }

    private function limitKey(string $sourceType, string $type): string
    {
        $source = $sourceType === 'upload' ? 'upload' : 'external';

        $map = [
            'image' => 'images',
            'music' => 'music',
            'video' => 'videos',
            'audio' => 'audios',
            'file' => 'files',
        ];

        return 'max_'.$source.'_'.($map[$type] ?? 'files');
    }
}
