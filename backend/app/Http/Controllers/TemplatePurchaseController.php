<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TemplatePurchaseController extends Controller
{
    public function purchase(Request $request, Template $template)
    {
        $user = $request->user();

        if (($user->role ?? null) === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'El administrador ya tiene acceso total. No necesita comprar plantillas.',
                'redirect_to' => '/admin/templates',
            ], 400);
        }

        if ($this->activeSubscription($user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Ya tienes una suscripción activa. No necesitas comprar plantillas individuales.',
                'code' => 'ACTIVE_SUBSCRIPTION_NO_PURCHASE',
                'redirect_to' => '/templates',
            ], 400);
        }

        if (! $template->allow_individual_purchase) {
            return response()->json([
                'success' => false,
                'message' => 'Esta plantilla no está disponible para compra individual.',
                'code' => 'INDIVIDUAL_PURCHASE_DISABLED',
                'redirect_to' => '/plans',
            ], 400);
        }

        if ($this->hasActiveTemplatePurchase($user, $template)) {
            return response()->json([
                'success' => true,
                'message' => 'Ya compraste esta plantilla y todavía está activa.',
                'already_purchased' => true,
                'redirect_to' => '/my-pages',
            ]);
        }

        $price = $this->getTemplatePrice($template);
        $config = $this->getTemplatePurchaseConfig($template);

        if ((int) $user->coins < $price) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes monedas suficientes.',
                'required_coins' => $price,
                'current_coins' => (int) $user->coins,
                'redirect_to' => '/wallet',
            ], 400);
        }

        $purchasedAt = now();
        $expiresAt = $this->addDuration(
            $purchasedAt,
            $config['access_duration_value'],
            $config['access_duration_unit']
        );

        DB::transaction(function () use (
            $user,
            $template,
            $price,
            $config,
            $purchasedAt,
            $expiresAt
        ) {
            if ($price > 0) {
                $user->coins -= $price;
                $user->save();
            }

            $user->templates()->attach($template->id, [
                'purchased_at' => $purchasedAt,
                'expires_at' => $expiresAt,
                'price_paid' => $price,
                'is_individual_purchase' => true,
                'access_duration_value' => $config['access_duration_value'],
                'access_duration_unit' => $config['access_duration_unit'],
                'page_duration_value' => $config['page_duration_value'],
                'page_duration_unit' => $config['page_duration_unit'],
                'admin_retention_days' => $config['admin_retention_days'],
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Plantilla comprada correctamente.',
            'coins_left' => (int) $user->fresh()->coins,
            'expires_at' => $expiresAt,
            'page_duration_value' => $config['page_duration_value'],
            'page_duration_unit' => $config['page_duration_unit'],
            'admin_retention_days' => $config['admin_retention_days'],
            'redirect_to' => '/my-pages',
        ]);
    }

    public function activateSubscription(Request $request)
    {
        $request->validate([
            'plan' => 'required|string',
        ]);

        $user = $request->user();

        $plan = Plan::where('slug', $request->plan)
            ->where('is_active', true)
            ->first();

        if (! $plan) {
            return response()->json([
                'success' => false,
                'message' => 'El plan seleccionado no existe o no está activo.',
            ], 404);
        }

        $config = $this->getPlanSubscriptionConfig($plan);
        $startsAt = now();
        $expiresAt = $this->addDuration(
            $startsAt,
            $config['duration_value'],
            $config['duration_unit']
        );

        if ((int) $user->coins < $config['required_coins']) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes monedas suficientes para activar el plan '.$config['plan_title'].'.',
                'required_coins' => $config['required_coins'],
                'current_coins' => (int) $user->coins,
                'redirect_to' => '/wallet',
            ], 400);
        }

        $activeSubscription = $this->activeSubscription($user->id);

        if ($activeSubscription && $activeSubscription->plan_slug === $config['plan_key']) {
            return response()->json([
                'success' => true,
                'message' => 'Ya estás suscrito al plan '.$config['plan_title'].'.',
                'plan' => $config['plan_key'],
                'active_plan' => $user->active_plan,
                'coins_left' => (int) $user->coins,
                'subscription' => $activeSubscription,
                'user' => $user->fresh(),
            ]);
        }

        DB::transaction(function () use ($user, $plan, $config, $startsAt, $expiresAt) {
            Subscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->update(['status' => 'expired']);

            if ($config['required_coins'] > 0) {
                $user->coins -= $config['required_coins'];
            }

            $user->active_plan = $config['plan_key'];
            $user->save();

            Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'plan_slug' => $config['plan_key'],
                'plan_name' => $config['plan_title'],
                'plan_price' => $config['required_coins'],
                'status' => 'active',
                'starts_at' => $startsAt,
                'expires_at' => $expiresAt,
                'paid_with' => $config['required_coins'] > 0 ? 'coins' : 'free',
                'amount_paid' => $config['required_coins'],
                'duration_value' => $config['duration_value'],
                'duration_unit' => $config['duration_unit'],
                'subscription_duration_value' => $config['duration_value'],
                'subscription_duration_unit' => $config['duration_unit'],
                'page_duration_value' => $config['page_duration_value'],
                'page_duration_unit' => $config['page_duration_unit'],
                'max_pages_per_day' => $config['max_pages_per_day'],
                'pages_per_day' => $config['max_pages_per_day'],
                'max_pages' => $config['max_pages'],
                'admin_retention_days' => $config['admin_retention_days'],
                'access_level' => $config['access_level'],
            ]);
        });

        $subscription = $this->activeSubscription($user->id);

        return response()->json([
            'success' => true,
            'message' => 'Plan '.$config['plan_title'].' activado correctamente.',
            'plan' => $config['plan_key'],
            'active_plan' => $user->fresh()->active_plan,
            'coins_left' => (int) $user->fresh()->coins,
            'subscription' => $subscription,
            'user' => $user->fresh(),
        ]);
    }

    public function myTemplates(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Usuario no autenticado',
            ], 401);
        }

        $templates = $user->templates()
            ->where(function ($query) {
                $query->whereNull('user_templates.expires_at')
                    ->orWhere('user_templates.expires_at', '>', now());
            })
            ->get();

        $subscription = $this->activeSubscription($user->id);

        return response()->json([
            'templates' => $templates,
            'purchased_templates' => $templates,
            'subscription' => $subscription,
            'active_subscription' => $subscription,
            'active_plan' => $subscription?->access_level ?? 'free',
            'plan_slug' => $subscription?->plan_slug ?? 'free',
        ]);
    }

    private function getTemplatePrice(Template $template): int
    {
        $price = (int) ($template->individual_price_coins ?? 0);

        if ($price <= 0) {
            $price = (int) ($template->price_coins ?? 0);
        }

        return max(0, $price);
    }

    private function getTemplatePurchaseConfig(Template $template): array
    {
        return [
            'access_duration_value' => max(1, (int) ($template->access_duration_value ?? 30)),
            'access_duration_unit' => $template->access_duration_unit ?: 'days',
            'page_duration_value' => max(1, (int) ($template->page_duration_value ?? 30)),
            'page_duration_unit' => $template->page_duration_unit ?: 'days',
            'admin_retention_days' => max(0, (int) ($template->admin_retention_days ?? 3)),
        ];
    }

    private function getPlanSubscriptionConfig(Plan $plan): array
    {
        return [
            'plan_key' => $plan->slug,
            'plan_title' => $plan->name,
            'required_coins' => max(0, (int) ($plan->price_amount ?? 0)),
            'duration_value' => max(1, (int) (
                $plan->subscription_duration_value
                ?? $plan->duration_value
                ?? 30
            )),
            'duration_unit' => (
                $plan->subscription_duration_unit
                ?? $plan->duration_unit
                ?? 'days'
            ),
            'page_duration_value' => max(1, (int) ($plan->page_duration_value ?? 30)),
            'page_duration_unit' => $plan->page_duration_unit ?: 'days',
            'max_pages_per_day' => max(1, (int) (
                $plan->pages_per_day
                ?? $plan->max_pages_per_day
                ?? 2
            )),
            'max_pages' => max(1, (int) (
                $plan->max_pages
                ?? 2
            )),
            'admin_retention_days' => max(0, (int) ($plan->admin_retention_days ?? 3)),
            'access_level' => $plan->access_level ?? 'free',
        ];
    }

    private function hasActiveTemplatePurchase($user, Template $template): bool
    {
        return $user->templates()
            ->where('template_id', $template->id)
            ->where(function ($query) {
                $query->whereNull('user_templates.expires_at')
                    ->orWhere('user_templates.expires_at', '>', now());
            })
            ->exists();
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

    private function addDuration($date, int $value, ?string $unit)
    {
        if ($value <= 0) {
            return null;
        }

        return $unit === 'hours'
            ? $date->copy()->addHours($value)
            : $date->copy()->addDays($value);
    }
}
