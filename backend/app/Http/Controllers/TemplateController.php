<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TemplateController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $activeSubscription = null;

        if ($user) {
            $activeSubscription = Subscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->where(function ($query) {
                    $query->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                })
                ->latest()
                ->first();
        }

        $templates = Template::where('is_active', 1)
            ->orderBy('id', 'asc')
            ->get()
            ->map(function ($template) use ($user, $activeSubscription) {
                $requiredPlan = $template->required_plan ?: 'free';

                $hasActiveSubscription = (bool) $activeSubscription;
                $userLevel = $activeSubscription->access_level ?? 'free';

                $userTemplate = null;

                if ($user) {
                    $userTemplate = DB::table('user_templates')
                        ->where('user_id', $user->id)
                        ->where('template_id', $template->id)
                        ->where(function ($query) {
                            $query->whereNull('expires_at')
                                ->orWhere('expires_at', '>', now());
                        })
                        ->latest('id')
                        ->first();
                }

                $isPurchased = (bool) $userTemplate;
                $isIndividualPurchase = (bool) ($userTemplate?->is_individual_purchase ?? false);

                $canAccessByPlan = $user
                    ? $this->planCanAccess($userLevel, $requiredPlan, $user->role ?? null)
                    : $requiredPlan === 'free';

                $canCreatePage =
                    ($user && ($user->role ?? null) === 'admin')
                    || $isPurchased
                    || ($hasActiveSubscription && $canAccessByPlan);

                $canPurchase = $user
                    && ! $hasActiveSubscription
                    && ! $isPurchased
                    && ($user->role ?? null) !== 'admin'
                    && (bool) $template->allow_individual_purchase;

                return [
                    'id' => $template->id,

                    'title' => $template->title ?: $template->name,
                    'name' => $template->name,
                    'slug' => $template->slug,
                    'category' => $template->category,

                    'description' => $template->description ?? '',

                    'image' => $template->image,
                    'preview_image' => $template->preview_image ?? $template->image,

                    'preview_url' => $template->preview_url,
                    'editor_url' => $template->editor_url,
                    'view_url' => $template->view_url,

                    'price_coins' => (int) $template->price_coins,
                    'individual_price_coins' => (int) (
                        $template->individual_price_coins
                        ?? $template->price_coins
                        ?? 0
                    ),

                    'is_free' => (bool) $template->is_free,
                    'is_active' => (bool) $template->is_active,

                    'required_plan' => $requiredPlan,

                    'allow_free_initial_use' => (bool) $template->allow_free_initial_use,
                    'free_initial_page_limit' => (int) ($template->free_initial_page_limit ?? 2),

                    'allow_individual_purchase' => (bool) $template->allow_individual_purchase,

                    'has_active_subscription' => $hasActiveSubscription,
                    'user_access_level' => $userLevel,

                    'is_purchased' => $isPurchased,
                    'is_individual_purchase' => $isIndividualPurchase,

                    'can_access_by_plan' => $canAccessByPlan,
                    'can_purchase' => $canPurchase,
                    'can_create_page' => $canCreatePage,

                    'previewClass' => $template->previewClass ?? '',
                    'symbol' => $template->symbol ?? '',
                ];
            });

        return response()->json($templates);
    }

    private function planCanAccess(?string $userLevel, string $requiredPlan, ?string $role = null): bool
    {
        if ($role === 'admin') {
            return true;
        }

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

        return ($levels[$userLevel ?: 'free'] ?? 1) >= ($levels[$requiredPlan ?: 'free'] ?? 1);
    }
}
