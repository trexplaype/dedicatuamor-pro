<?php

namespace App\Services;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\UserPage;
use Illuminate\Support\Facades\DB;

class PageEditorPermissionService
{
    public function resolve(UserPage $page, $user): array
    {
        $page->loadMissing('template');

        if (($user->role ?? null) === 'admin') {
            return $this->adminPermissions($page);
        }

        $purchase = $this->activeTemplatePurchase($user->id, $page->template_id);

        if ($purchase) {
            return $this->templatePurchasePermissions($page);
        }

        $subscription = $this->activeSubscription($user->id);

        if ($subscription) {
            return $this->subscriptionPermissions($page, $subscription);
        }

        return $this->freePermissions($page);
    }

    private function adminPermissions(UserPage $page): array
    {
        return $this->buildPermissions('admin', 'admin', $page, [
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

            'can_download_html' => true,
        ]);
    }

    private function templatePurchasePermissions(UserPage $page): array
    {
        $template = $page->template;

        return $this->buildPermissions('template_purchase', $template?->required_plan ?? 'premium', $page, [
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

            'can_download_html' => false,
        ]);
    }

    private function subscriptionPermissions(UserPage $page, Subscription $subscription): array
    {
        $plan = Plan::find($subscription->plan_id);

        return $this->buildPermissions('subscription', $plan?->access_level ?? $subscription->access_level ?? 'free', $page, [
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

            'can_download_html' => false,
        ]);
    }

    private function freePermissions(UserPage $page): array
    {
        $plan = Plan::where('access_level', 'free')
            ->where('is_active', true)
            ->first();

        return $this->buildPermissions('free', 'free', $page, [
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

            'can_download_html' => false,
        ]);
    }

    private function buildPermissions(string $source, string $level, UserPage $page, array $rules): array
    {
        return [
            'source' => $source,
            'level' => $level,

            'can_download_html' => (bool) ($rules['can_download_html'] ?? false),

            'upload' => [
                'image' => $this->canUse($rules, 'max_upload_images', 'allow_upload_assets'),
                'music' => $this->canUse($rules, 'max_upload_music', 'allow_upload_assets'),
                'video' => $this->canUse($rules, 'max_upload_videos', 'allow_upload_assets'),
                'audio' => $this->canUse($rules, 'max_upload_audios', 'allow_upload_assets'),
                'file' => $this->canUse($rules, 'max_upload_files', 'allow_upload_assets'),
            ],

            'external' => [
                'image' => $this->canUse($rules, 'max_external_images', 'allow_external_assets'),
                'music' => $this->canUse($rules, 'max_external_music', 'allow_external_assets'),
                'video' => $this->canUse($rules, 'max_external_videos', 'allow_external_assets'),
                'audio' => $this->canUse($rules, 'max_external_audios', 'allow_external_assets'),
                'file' => $this->canUse($rules, 'max_external_files', 'allow_external_assets'),
            ],

            'limits' => [
                'max_upload_images' => (int) ($rules['max_upload_images'] ?? 0),
                'max_upload_music' => (int) ($rules['max_upload_music'] ?? 0),
                'max_upload_videos' => (int) ($rules['max_upload_videos'] ?? 0),
                'max_upload_audios' => (int) ($rules['max_upload_audios'] ?? 0),
                'max_upload_files' => (int) ($rules['max_upload_files'] ?? 0),

                'max_external_images' => (int) ($rules['max_external_images'] ?? 0),
                'max_external_music' => (int) ($rules['max_external_music'] ?? 0),
                'max_external_videos' => (int) ($rules['max_external_videos'] ?? 0),
                'max_external_audios' => (int) ($rules['max_external_audios'] ?? 0),
                'max_external_files' => (int) ($rules['max_external_files'] ?? 0),
            ],

            'template' => [
                'id' => $page->template?->id,
                'name' => $page->template?->name ?? $page->template?->title,
                'use_default_assets' => (bool) ($rules['use_default_assets'] ?? true),
            ],

            'page' => [
                'id' => $page->id,
                'is_published' => (bool) $page->is_published,
                'slug' => $page->slug,
                'public_url' => $page->public_url,
            ],
        ];
    }

    private function canUse(array $rules, string $limitKey, string $allowKey): bool
    {
        return (bool) ($rules[$allowKey] ?? false)
            && (int) ($rules[$limitKey] ?? 0) > 0;
    }

    private function activeTemplatePurchase(int $userId, int $templateId)
    {
        return DB::table('user_templates')
            ->where('user_id', $userId)
            ->where('template_id', $templateId)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->latest('id')
            ->first();
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
}