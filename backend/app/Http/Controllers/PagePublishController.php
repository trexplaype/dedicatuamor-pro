<?php

namespace App\Http\Controllers;

use App\Models\LinkOption;
use App\Models\Plan;
use App\Models\QrStyle;
use App\Models\Subscription;
use App\Models\UserPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PagePublishController extends Controller
{
    private array $levels = [
        'free' => 1,
        'premium' => 2,
        'vip' => 3,
        'exclusive' => 4,
        'super-user' => 4,
        'super_user' => 4,
    ];

    private array $reservedSlugs = [
        'admin',
        'api',
        'login',
        'register',
        'templates',
        'plans',
        'my-pages',
        'wallet',
        'rewards',
        'checkout',
        'zip-editor',
        'editor',
        'public-pages',
    ];

    protected function resolvePublishPermissions(UserPage $page, $user): array
    {
        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->latest()
            ->first();

        if ($subscription) {
            $plan = Plan::find($subscription->plan_id);
            $level = $plan?->access_level ?? $subscription->access_level ?? 'free';

            return [
                'source' => 'subscription',
                'level' => $level,
                'custom_link' => (bool) ($plan?->custom_link ?? false),
                'custom_qr' => (bool) ($plan?->custom_qr ?? false),
                'max_pages' => max(1, (int) ($plan?->max_pages ?? 2)),
                'page_duration_value' => max(1, (int) ($plan?->page_duration_value ?? 30)),
                'page_duration_unit' => $plan?->page_duration_unit ?? 'days',
            ];
        }

        $purchase = DB::table('user_templates')
            ->where('user_id', $user->id)
            ->where('template_id', $page->template_id)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->latest('id')
            ->first();

        if ($purchase && $page->template) {
            $level = $page->template->required_plan ?: $page->template->access_level ?: 'free';

            return [
                'source' => 'template_purchase',
                'level' => $level,
                'custom_link' => (bool) ($page->template->allow_custom_link ?? false),
                'custom_qr' => (bool) ($page->template->allow_custom_qr ?? false),
                'max_pages' => max(1, (int) ($page->template->max_pages_by_purchase ?? 1)),
                'page_duration_value' => max(1, (int) (
                    $purchase->page_duration_value
                    ?? $page->template->page_duration_value
                    ?? 30
                )),
                'page_duration_unit' => (
                    $purchase->page_duration_unit
                    ?? $page->template->page_duration_unit
                    ?? 'days'
                ),
            ];
        }

        $freePlan = Plan::where('slug', 'free')
            ->orWhere('access_level', 'free')
            ->first();

        return [
            'source' => 'free',
            'level' => 'free',
            'custom_link' => false,
            'custom_qr' => false,
            'max_pages' => max(1, (int) ($freePlan?->max_pages ?? 2)),
            'page_duration_value' => max(1, (int) ($freePlan?->page_duration_value ?? 30)),
            'page_duration_unit' => $freePlan?->page_duration_unit ?? 'days',
        ];
    }

    private function allowedLevels(?string $level): array
    {
        $current = $this->levels[$level ?: 'free'] ?? 1;

        return collect($this->levels)
            ->filter(fn ($value) => $value <= $current)
            ->keys()
            ->unique()
            ->values()
            ->all();
    }

    public function availableLinks(Request $request, UserPage $page)
    {
        if ($page->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $page->load('template');

        $permissions = $this->resolvePublishPermissions($page, $request->user());

        $links = LinkOption::where('is_active', true)
            ->whereIn('plan_level', $this->allowedLevels($permissions['level']))
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'source' => $permissions['source'],
            'level' => $permissions['level'],
            'custom_link' => $permissions['custom_link'],
            'links' => $links,
        ]);
    }

    public function availableQrStyles(Request $request, UserPage $page)
    {
        if ($page->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $page->load('template');

        $permissions = $this->resolvePublishPermissions($page, $request->user());

        $styles = QrStyle::where('is_active', true)
            ->whereIn('plan_level', $this->allowedLevels($permissions['level']))
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'source' => $permissions['source'],
            'level' => $permissions['level'],
            'custom_qr' => $permissions['custom_qr'],
            'styles' => $styles,
        ]);
    }

    public function checkSlug(Request $request)
    {
        $data = $request->validate([
            'slug' => 'required|string|max:255',
            'page_id' => 'nullable|integer|exists:user_pages,id',
        ]);

        $slug = Str::slug($data['slug']);
        $pageId = $data['page_id'] ?? null;

        if (! $slug) {
            return response()->json([
                'available' => false,
                'slug' => '',
                'message' => 'El enlace no es válido.',
                'suggestions' => [],
            ]);
        }

        if (in_array($slug, $this->reservedSlugs, true)) {
            return response()->json([
                'available' => false,
                'slug' => $slug,
                'message' => 'Ese enlace está reservado.',
                'suggestions' => $this->slugSuggestions($slug, $pageId),
            ]);
        }

        $exists = UserPage::where('slug', $slug)
            ->when($pageId, fn ($query) => $query->where('id', '!=', $pageId))
            ->exists();

        return response()->json([
            'available' => ! $exists,
            'slug' => $slug,
            'message' => $exists
                ? 'Ese enlace ya está siendo utilizado.'
                : 'Enlace disponible.',
            'suggestions' => $exists
                ? $this->slugSuggestions($slug, $pageId)
                : [],
        ]);
    }

    public function publish(Request $request, UserPage $page)
    {
        $user = $request->user();

        if ($page->user_id !== $user->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        if ($page->expires_at && now()->greaterThan($page->expires_at)) {
            return response()->json([
                'message' => 'Esta página ya expiró.',
                'code' => 'PAGE_EXPIRED',
            ], 400);
        }

        $page->load('template');

        $permissions = $this->resolvePublishPermissions($page, $user);
        $allowedLevels = $this->allowedLevels($permissions['level']);

        $activePages = UserPage::where('user_id', $user->id)
            ->where('id', '!=', $page->id)
            ->where(function ($query) {
                $query->where('is_published', true)
                    ->orWhere('status', 'published');
            })
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->count();

        if ($page->status !== 'published' && $activePages >= $permissions['max_pages']) {
            return response()->json([
                'message' => 'Llegaste al límite de páginas activas permitidas.',
                'code' => 'MAX_ACTIVE_PAGES_REACHED',
                'limit' => $permissions['max_pages'],
            ], 403);
        }

        $validated = $request->validate([
            'custom_slug_base' => 'nullable|string|max:150',
            'slug_suffix' => 'nullable|string|max:100',
            'link_option_id' => 'nullable|integer|exists:link_options,id',
            'qr_style_id' => 'nullable|integer|exists:qr_styles,id',
        ]);

        $linkOption = null;
        $slugBase = null;
        $slugSuffix = Str::slug($validated['slug_suffix'] ?? '');

        if (! empty($validated['custom_slug_base'])) {
            if (! $permissions['custom_link']) {
                return response()->json([
                    'message' => 'Tu plan no permite crear una frase base propia.',
                    'code' => 'CUSTOM_LINK_NOT_ALLOWED',
                ], 403);
            }

            $slugBase = Str::slug($validated['custom_slug_base']);
        } elseif (! empty($validated['link_option_id'])) {
            $linkOption = LinkOption::where('id', $validated['link_option_id'])
                ->where('is_active', true)
                ->whereIn('plan_level', $allowedLevels)
                ->first();

            if (! $linkOption) {
                return response()->json([
                    'message' => 'Ese enlace no está disponible para tu acceso.',
                    'code' => 'LINK_NOT_ALLOWED',
                ], 403);
            }

            $slugBase = Str::slug($linkOption->slug);
        } else {
            $linkOption = LinkOption::where('is_active', true)
                ->whereIn('plan_level', $allowedLevels)
                ->orderBy('sort_order')
                ->first();

            $slugBase = $linkOption ? Str::slug($linkOption->slug) : null;
        }

        if (! $slugBase) {
            return response()->json([
                'message' => 'Debes seleccionar o crear una frase base.',
                'code' => 'SLUG_BASE_REQUIRED',
            ], 422);
        }

        if (! $slugSuffix) {
            return response()->json([
                'message' => 'Debes escribir una palabra final para completar tu enlace.',
                'code' => 'SLUG_SUFFIX_REQUIRED',
            ], 422);
        }

        $slug = Str::slug($slugBase.'-'.$slugSuffix);

        if (! $slug) {
            return response()->json(['message' => 'El enlace no es válido.'], 422);
        }

        if (in_array($slug, $this->reservedSlugs, true)) {
            return response()->json([
                'message' => 'Ese enlace está reservado. Usa otro.',
                'code' => 'RESERVED_SLUG',
                'suggestions' => $this->slugSuggestions($slug, $page->id),
            ], 422);
        }

        $exists = UserPage::where('slug', $slug)
            ->where('id', '!=', $page->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Ese enlace ya está siendo utilizado.',
                'code' => 'SLUG_TAKEN',
                'suggestions' => $this->slugSuggestions($slug, $page->id),
            ], 422);
        }

        $qrStyleId = null;

        if (! empty($validated['qr_style_id'])) {
            $qrStyle = QrStyle::where('id', $validated['qr_style_id'])
                ->where('is_active', true)
                ->whereIn('plan_level', $allowedLevels)
                ->first();

            if ($qrStyle) {
                $qrStyleId = $qrStyle->id;
            }
        }

        if (! $qrStyleId) {
            $qrStyleId = QrStyle::where('is_active', true)
                ->where('plan_level', 'free')
                ->orderBy('sort_order')
                ->value('id');
        }

        $baseUrl = rtrim(config('app.frontend_url'), '/');
        $publicUrl = $baseUrl.'/'.$slug;

        $page->slug_base = $slugBase;
        $page->slug_suffix = $slugSuffix;
        $page->slug = $slug;
        $page->public_url = $publicUrl;
        $page->link_option_id = $linkOption?->id;
        $page->qr_style_id = $qrStyleId;

        $page->status = 'published';
        $page->is_published = true;
        $page->published_at = $page->published_at ?: now();

        if (! $page->expires_at) {
            $page->expires_at = $this->addDuration(
                now(),
                $permissions['page_duration_value'],
                $permissions['page_duration_unit']
            );
        }

        $page->save();

        return response()->json([
            'success' => true,
            'message' => 'Página publicada correctamente.',
            'source' => $permissions['source'],
            'level' => $permissions['level'],
            'custom_link' => $permissions['custom_link'],
            'custom_qr' => $permissions['custom_qr'],
            'slug_base' => $slugBase,
            'slug_suffix' => $slugSuffix,
            'slug' => $slug,
            'page' => $page,
            'public_url' => $publicUrl,
        ]);
    }

    private function slugSuggestions(string $slug, ?int $pageId = null): array
    {
        $suffixes = [
            'love',
            'amor',
            'para-ti',
            'especial',
            '2026',
            now()->format('dmy'),
        ];

        $suggestions = [];

        foreach ($suffixes as $suffix) {
            $candidate = Str::slug($slug.'-'.$suffix);

            $exists = UserPage::where('slug', $candidate)
                ->when($pageId, fn ($query) => $query->where('id', '!=', $pageId))
                ->exists();

            if (! $exists && ! in_array($candidate, $this->reservedSlugs, true)) {
                $suggestions[] = $candidate;
            }

            if (count($suggestions) >= 3) {
                break;
            }
        }

        return $suggestions;
    }

    private function addDuration($date, int $value, ?string $unit)
    {
        return $unit === 'hours'
            ? $date->copy()->addHours($value)
            : $date->copy()->addDays($value);
    }
}