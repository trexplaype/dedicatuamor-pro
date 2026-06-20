<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class AdminPlanController extends Controller
{
    public function index()
    {
        return Plan::orderBy('id')->get()->map(function ($plan) {
            return $this->withUsage($plan);
        });
    }

    public function store(Request $request)
    {
        $data = $this->validatePlan($request);

        $data['slug'] = $data['slug'] ?: Str::slug($data['name']);
        $data['features'] = $data['features'] ?? [];
        $data['is_active'] = $request->boolean('is_active', true);
        $data['only_new_users'] = $request->boolean('only_new_users', false);
        $data['has_qr'] = $request->boolean('has_qr', false);
        $data['discount_percent'] = $data['discount_percent'] ?? 0;

        $data['allow_upload_assets'] = $request->boolean('allow_upload_assets', false);
        $data['allow_external_assets'] = $request->boolean('allow_external_assets', false);
        $data['use_default_assets'] = $request->boolean('use_default_assets', true);

        $data = $this->onlyExistingPlanColumns($data);

        $plan = Plan::create($data);

        return response()->json([
            'message' => 'Plan creado correctamente.',
            'plan' => $this->withUsage($plan),
        ], 201);
    }

    public function show(Plan $plan)
    {
        return $this->withUsage($plan);
    }

    public function update(Request $request, Plan $plan)
    {
        $data = $this->validatePlan($request, $plan->id);

        if ($request->has('features')) {
            $data['features'] = collect($request->features)
                ->filter()
                ->values()
                ->toArray();
        }

        if ($request->has('is_active')) {
            $data['is_active'] = $request->boolean('is_active');
        }

        if ($request->has('only_new_users')) {
            $data['only_new_users'] = $request->boolean('only_new_users');
        }

        if ($request->has('has_qr')) {
            $data['has_qr'] = $request->boolean('has_qr');
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

        $data = $this->onlyExistingPlanColumns($data);

        $plan->update($data);

        $plan = $plan->fresh();

        $this->syncActiveSubscriptions($plan);

        return response()->json([
            'message' => 'Plan actualizado correctamente.',
            'plan' => $this->withUsage($plan),
        ]);
    }

    public function destroy(Plan $plan)
    {
        $plan->delete();

        return response()->json([
            'message' => 'Plan eliminado correctamente.',
        ]);
    }

    private function validatePlan(Request $request, $planId = null)
    {
        return $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:plans,slug,'.$planId,

            'price_type' => 'sometimes|required|in:free,coins,money',
            'price_amount' => 'sometimes|required|numeric|min:0',

            'duration_value' => 'nullable|integer|min:0',
            'duration_unit' => 'nullable|in:hours,days',

            'page_duration_value' => 'nullable|integer|min:1',
            'page_duration_unit' => 'nullable|in:hours,days',

            'max_pages_per_day' => 'nullable|integer|min:0',
            'max_pages' => 'nullable|integer|min:0',

            'max_storage_mb' => 'nullable|integer|min:0',

            'custom_music_per_month' => 'nullable|integer|min:0',
            'custom_photos_per_month' => 'nullable|integer|min:0',
            'downloadable_codes_per_month' => 'nullable|integer|min:0',

            'custom_link' => 'sometimes|boolean',
            'custom_qr' => 'sometimes|boolean',
            'has_qr' => 'sometimes|boolean',

            'premium_templates' => 'sometimes|boolean',
            'vip_templates' => 'sometimes|boolean',
            'exclusive_templates' => 'sometimes|boolean',

            'stats_level' => 'nullable|string|max:255',
            'access_level' => 'sometimes|required|in:free,premium,vip,exclusive,super-user',

            'features' => 'nullable|array',
            'features.*' => 'nullable|string|max:255',

            'is_active' => 'sometimes|boolean',
            'monthly_limit' => 'nullable|integer|min:1',
            'discount_percent' => 'nullable|integer|min:0|max:100',
            'discount_ends_at' => 'nullable|date',
            'only_new_users' => 'sometimes|boolean',

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
    }

    private function onlyExistingPlanColumns(array $data): array
    {
        return collect($data)
            ->filter(function ($value, $key) {
                return Schema::hasColumn('plans', $key);
            })
            ->toArray();
    }

    private function syncActiveSubscriptions(Plan $plan): void
    {
        $data = [
            'pages_per_day' => $plan->max_pages_per_day,
            'max_pages_per_day' => $plan->max_pages_per_day,
            'page_duration_value' => $plan->page_duration_value,
            'page_duration_unit' => $plan->page_duration_unit,
            'access_level' => $plan->access_level,
            'admin_retention_days' => $plan->admin_retention_days,
        ];

        if (Schema::hasColumn('subscriptions', 'max_pages')) {
            $data['max_pages'] = $plan->max_pages;
        }

        Subscription::where('plan_id', $plan->id)
            ->where('status', 'active')
            ->update($data);
    }

    private function withUsage(Plan $plan)
    {
        $monthCount = Subscription::where('plan_id', $plan->id)
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();

        $plan->monthly_used = $monthCount;
        $plan->monthly_available = $plan->monthly_limit
            ? max($plan->monthly_limit - $monthCount, 0)
            : null;

        $plan->is_sold_out_this_month = $plan->monthly_limit
            ? $monthCount >= $plan->monthly_limit
            : false;

        return $plan;
    }
}
