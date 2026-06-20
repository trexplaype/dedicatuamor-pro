<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Template;
use App\Models\UserPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\PageEditorPermissionService;

class UserPageController extends Controller
{
    public function index(Request $request)
    {
        return UserPage::with('template')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();
    }

    public function myPages(Request $request)
    {
        return $this->index($request);
    }

    public function store(Request $request, Template $template)
    {
        return $this->createFromTemplate($request, $template);
    }

    public function createFromTemplate(Request $request, Template $template)
    {
        $user = $request->user();

        if (! $template->is_active && $user->role !== 'admin') {
            return response()->json([
                'message' => 'Esta plantilla no está activa.',
                'code' => 'TEMPLATE_INACTIVE',
            ], 400);
        }

        $access = $this->resolveUserAccess($user, $template);

        if (! $access['allowed']) {
            return response()->json([
                'message' => $access['message'],
                'code' => $access['code'],
                'redirect_to' => $access['redirect_to'],
            ], 400);
        }

        $limitResponse = $this->validatePageCreationLimits($user, $template, $access);

        if ($limitResponse) {
            return $limitResponse;
        }

        $now = now();
        $templateName = $this->getTemplateName($template);
        $expiresAt = $this->addDuration(
            $now,
            (int) $access['page_duration_value'],
            $access['page_duration_unit']
        );

        $page = UserPage::create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'user_template_id' => $access['user_template_id'],
            'plan_id' => $access['plan_id'],
            'title' => $request->title ?: $templateName,
            'template_title' => $templateName,
            'content' => null,
            'data_json' => $this->buildDefaultData($template),

            'is_published' => false,
            'status' => 'draft',
            'published_at' => null,

            'expires_at' => $expiresAt,
            'admin_retention_days' => $access['admin_retention_days'],
        ]); 
        return response()->json([
            'message' => 'Página creada correctamente.',
            'page' => $page->load('template'),
            'access_source' => $access['source'],
            'expires_at' => $expiresAt,
            'admin_retention_days' => $access['admin_retention_days'],
            'user_template_id' => $access['user_template_id'],
            'plan_id' => $access['plan_id'],
        ], 201);
    }

    public function showEditor(Request $request, UserPage $page)
    {
        if ($page->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        return $page->load('template');
    }

    public function show(Request $request, UserPage $userPage)
    {
        if ($userPage->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        return $userPage->load('template');
    }
    
    public function permissions(
    Request $request,
    UserPage $page,
    PageEditorPermissionService $service
    ) {
    if ($page->user_id !== $request->user()->id) {
        return response()->json([
            'message' => 'No autorizado.',
        ], 403);
    }

    $permissions = $service->resolve(
        $page,
        $request->user()
    );

    $permissions['saved_data'] =
        is_array($page->data_json)
            ? $page->data_json
            : json_decode($page->data_json ?? '{}', true);

    return response()->json($permissions);
    }

    public function update(Request $request, UserPage $userPage)
    {
        return $this->updatePage($request, $userPage);
    }

    public function updatePage(Request $request, UserPage $page)
    {
        if ($page->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        if ($page->expires_at && now()->greaterThan($page->expires_at)) {
            return response()->json([
                'message' => 'Esta página ya expiró.',
                'code' => 'PAGE_EXPIRED',
            ], 400);
        }

        $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'data_json' => 'nullable|array',
            'is_published' => 'nullable|boolean',
        ]);

        $page->update($this->buildUpdateData($request));

        return response()->json([
            'message' => 'Página guardada correctamente.',
            'page' => $page->load('template'),
        ]);
    }

    public function publicPage($slug)
    {
    $page = UserPage::with('template')
        ->where('slug', $slug)
        ->where(function ($query) {
            $query->where('is_published', true)
                ->orWhere('status', 'published');
        })
        ->where(function ($query) {
            $query->whereNull('expires_at')
                ->orWhere('expires_at', '>', now());
        })
        ->firstOrFail();

    $html = $page->content ?: ($page->template->html_content ?? '');

    $data = json_encode(
        $page->data_json ?? [],
        JSON_UNESCAPED_UNICODE
    );

    $headDataScript = <<<HTML
    <script>

    window.DEDICATUAMOR_PAGE_DATA = {$data};

    (function () {

        const originalFetch = window.fetch;

        window.fetch = function(input, init) {

            const url =
                typeof input === 'string'
                    ? input
                    : (input && input.url ? input.url : '');

            if (/template\\.json/i.test(url)) {


                return Promise.resolve(
                    new Response(
                        JSON.stringify(window.DEDICATUAMOR_PAGE_DATA || {}),
                        {
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    )
                );
            }

            return originalFetch.apply(this, arguments);
        };

    })();
    </script>
    HTML;

    if (preg_match('/<head[^>]*>/i', $html)) {

        $html = preg_replace(
            '/<head([^>]*)>/i',
            '<head$1>' . $headDataScript,
            $html,
            1
        );

    } else {

        $html = $headDataScript . $html;

    }

    $html = preg_replace(
        '/fetch\s*\(\s*["\'][^"\']*template\.json[^"\']*["\']\s*\)/i',
        'Promise.resolve({ json: () => Promise.resolve(window.DEDICATUAMOR_PAGE_DATA || {}) })',
        $html
    );


    foreach (($page->data_json ?? []) as $key => $value) {
        if (is_array($value)) {
            $value = implode(',', $value);
        }

        $safeValue = e((string) $value);

        $html = str_replace('{{'.$key.'}}', $safeValue, $html);
        $html = str_replace('{{ '.$key.' }}', $safeValue, $html);
    }

    $assetBaseUrl = null;

    if ($page->template?->view_url) {
        $assetBaseUrl = rtrim(
            url(dirname($page->template->view_url)),
            '/'
        ).'/';
    }

    if (
        $assetBaseUrl &&
        ! str_contains(strtolower($html), '<base ')
    ) {
        if (preg_match('/<head[^>]*>/i', $html)) {
            $html = preg_replace(
                '/<head([^>]*)>/i',
                '<head$1><base href="'.$assetBaseUrl.'">',
                $html,
                1
            );
        } else {
            $html =
                '<base href="'.$assetBaseUrl.'">' .
                $html;
        }
    }

    return response($html)
        ->header('Content-Type', 'text/html; charset=UTF-8');
    }

    private function validatePageCreationLimits($user, Template $template, array $access)
    {
        if ($this->countTodayPages($user->id) >= $access['max_pages_per_day']) {
            return response()->json([
                'message' => 'Alcanzaste tu límite diario de páginas.',
                'code' => 'DAILY_LIMIT_REACHED',
                'limit' => $access['max_pages_per_day'],
                'redirect_to' => '/plans',
            ], 400);
        }

        $totalPagesLimit = (int) ($access['max_pages'] ?? 0);

        if ($totalPagesLimit > 0 && $this->countActivePages($user->id) >= $totalPagesLimit) {
            return response()->json([
                'message' => 'Alcanzaste el máximo de páginas totales permitidas por tu plan.',
                'code' => 'MAX_PLAN_PAGES_REACHED',
                'limit' => $totalPagesLimit,
                'redirect_to' => '/plans',
            ], 400);
        }

        $templatePagesLimit = (int) ($access['max_pages_by_template'] ?? 0);

        if ($templatePagesLimit > 0 && $this->countActiveTemplatePages($user->id, $template->id) >= $templatePagesLimit) {
            return response()->json([
                'message' => 'Alcanzaste el máximo de páginas permitidas para esta plantilla.',
                'code' => 'MAX_TEMPLATE_PAGES_REACHED',
                'limit' => $templatePagesLimit,
                'template_id' => $template->id,
            ], 400);
        }

        return null;
    }

    private function resolveUserAccess($user, Template $template): array
    {
        if (($user->role ?? null) === 'admin') {
            return $this->resolveAdminAccess($template);
        }

        $userTemplate = $this->activeTemplatePurchase($user->id, $template->id);

        if ($userTemplate) {
            return $this->resolveTemplatePurchaseAccess($userTemplate, $template);
        }

        $activeSubscription = $this->activeSubscription($user->id);

        if ($activeSubscription) {
            return $this->resolveSubscriptionAccess($activeSubscription, $template);
        }

        return $this->resolveFreeAccess($template);
    }

    private function resolveAdminAccess(Template $template): array
    {
        return [
            'allowed' => true,
            'source' => 'admin',
            'plan_id' => null,
            'user_template_id' => null,
            'max_pages_per_day' => 999999,
            'max_pages' => 999999,
            'max_pages_by_template' => 999999,
            'page_duration_value' => max(1, (int) ($template->page_duration_value ?? 3650)),
            'page_duration_unit' => $template->page_duration_unit ?: 'days',
            'admin_retention_days' => max(0, (int) ($template->admin_retention_days ?? 30)),
        ];
    }

    private function resolveTemplatePurchaseAccess($userTemplate, Template $template): array
    {
        return [
            'allowed' => true,
            'source' => 'template_purchase',
            'plan_id' => null,
            'user_template_id' => $userTemplate->id,
            'max_pages_per_day' => 999999,
            'max_pages' => 0,
            'max_pages_by_template' => max(1, (int) ($template->max_pages_by_purchase ?? 1)),
            'page_duration_value' => max(1, (int) (
                $userTemplate->page_duration_value
                ?? $template->page_duration_value
                ?? 30
            )),
            'page_duration_unit' => (
                $userTemplate->page_duration_unit
                ?? $template->page_duration_unit
                ?? 'days'
            ),
            'admin_retention_days' => max(0, (int) (
                $userTemplate->admin_retention_days
                ?? $template->admin_retention_days
                ?? 3
            )),
        ];
    }

    private function resolveSubscriptionAccess(Subscription $activeSubscription, Template $template): array
    {
        if (! $this->planCanAccessTemplate($activeSubscription->access_level, $template)) {
            return [
                'allowed' => false,
                'message' => 'Esta plantilla requiere un plan superior.',
                'code' => 'PLAN_LEVEL_REQUIRED',
                'redirect_to' => '/plans',
            ];
        }

        $plan = Plan::find($activeSubscription->plan_id);

        return [
            'allowed' => true,
            'source' => 'subscription',
            'plan_id' => $activeSubscription->plan_id,
            'user_template_id' => null,
            'max_pages_per_day' => max(1, (int) (
                $plan?->max_pages_per_day
                ?? $activeSubscription->pages_per_day
                ?? $activeSubscription->max_pages_per_day
                ?? 2
            )),
            'max_pages' => max(1, (int) (
                $plan?->max_pagesdime 
                ?? $activeSubscription->max_pages
                ?? 2
            )),
            'max_pages_by_template' => max(1, (int) (
                $template->max_pages_by_plan
                ?? $plan?->max_pages
                ?? $activeSubscription->max_pages
                ?? 2
            )),
            'page_duration_value' => max(1, (int) (
                $plan?->page_duration_value
                ?? $activeSubscription->page_duration_value
                ?? 30
            )),
            'page_duration_unit' => (
                $plan?->page_duration_unit
                ?? $activeSubscription->page_duration_unit
                ?? 'days'
            ),
            'admin_retention_days' => max(0, (int) (
                $plan?->admin_retention_days
                ?? $activeSubscription->admin_retention_days
                ?? 3
            )),
        ];
    }

    private function resolveFreeAccess(Template $template): array
    {
        $freePlan = Plan::where('access_level', 'free')
            ->where('is_active', true)
            ->first();

        if (! $freePlan) {
            return [
                'allowed' => false,
                'message' => 'El plan gratis no está configurado.',
                'code' => 'FREE_PLAN_NOT_CONFIGURED',
                'redirect_to' => '/plans',
            ];
        }

        if (! $this->freeCanTryTemplate($template)) {
            return [
                'allowed' => false,
                'message' => 'Esta plantilla requiere comprar la plantilla o suscribirte a un plan superior.',
                'code' => 'TEMPLATE_REQUIRES_PAYMENT',
                'redirect_to' => '/plans',
            ];
        }

        return [
            'allowed' => true,
            'source' => 'free_trial',
            'plan_id' => $freePlan->id,
            'user_template_id' => null,
            'max_pages_per_day' => max(1, (int) ($freePlan->max_pages_per_day ?? 2)),
            'max_pages' => max(1, (int) ($freePlan->max_pages ?? 2)),
            'max_pages_by_template' => max(1, (int) (
                $template->free_initial_page_limit
                ?? $freePlan->max_pages
                ?? 2
            )),
            'page_duration_value' => max(1, (int) ($freePlan->page_duration_value ?? 30)),
            'page_duration_unit' => $freePlan->page_duration_unit ?: 'days',
            'admin_retention_days' => max(0, (int) ($freePlan->admin_retention_days ?? 3)),
        ];
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

    private function countTodayPages(int $userId): int
    {
        return UserPage::where('user_id', $userId)
            ->whereDate('created_at', today())
            ->count();
    }

    private function countActivePages(int $userId): int
    {
        return UserPage::where('user_id', $userId)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->where(function ($query) {
                $query->where('is_published', true)
                    ->orWhere('status', 'published');
            })
            ->count();
    }

    private function countActiveTemplatePages(int $userId, int $templateId): int
    {
        return UserPage::where('user_id', $userId)
            ->where('template_id', $templateId)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->where(function ($query) {
                $query->where('is_published', true)
                    ->orWhere('status', 'published');
            })
            ->count();
    }

    private function buildDefaultData(Template $template): array
    {
        $defaultData = [];
        foreach (($template->fields_json ?? []) as $field) {
            if (isset($field['name'])) {
                $defaultData[$field['name']] = '';
            }
        }

        return $defaultData;
    }

    private function buildUpdateData(Request $request): array
    {
        $data = [];

        if ($request->filled('title')) {
            $data['title'] = $request->title;
        }

        if ($request->has('content')) {
            $data['content'] = $request->content;
        }

        if ($request->has('data_json')) {
            $data['data_json'] = $request->data_json;
        }

        if ($request->has('is_published')) {

            $isPublished = $request->boolean('is_published');

            $data['is_published'] = $isPublished;
            $data['status'] = $isPublished ? 'published' : 'draft';

            if ($isPublished) {
                $data['published_at'] = now();
            }
        }

        return $data;
    }

    private function getTemplateName(Template $template): string
    {
        return $template->title ?: $template->name ?: 'Plantilla';
    }

    private function freeCanTryTemplate(Template $template): bool
    {
        $required = $template->required_plan ?: 'free';

        if ($required === 'free') {
            return true;
        }

        if ($required === 'premium' && $template->allow_free_initial_use) {
            return true;
        }

        return false;
    }

    private function planCanAccessTemplate(?string $accessLevel, Template $template): bool
    {
        $required = $template->required_plan ?: 'free';

        $levels = [
            'free' => 1,
            'premium' => 2,
            'vip' => 3,
            'exclusive' => 4,
            'super_user' => 4,
            'super-user' => 4,
            'admin' => 999,
            'admin-only' => 999,
        ];

        if (($accessLevel ?? 'free') === 'admin') {
            return true;
        }

        return ($levels[$accessLevel ?: 'free'] ?? 1) >= ($levels[$required] ?? 1);
    }

    private function addDuration($date, int $value, ?string $unit)
    {
        return $unit === 'hours'
            ? $date->copy()->addHours($value)
            : $date->copy()->addDays($value);
    }
}
