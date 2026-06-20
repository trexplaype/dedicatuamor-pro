<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PlanController extends Controller
{
    public function index()
    {
        return Plan::where('is_active', true)
            ->orderBy('id')
            ->get()
            ->map(function ($plan) {
                return $this->withUsage($plan);
            });
    }

    public function subscribe(Request $request, Plan $plan)
    {
        $user = $request->user();

        if (! $plan->is_active) {
            return response()->json([
                'message' => 'Este plan no está disponible.',
            ], 400);
        }

        if ($this->isSoldOutThisMonth($plan)) {
            return response()->json([
                'message' => 'Este plan está agotado este mes.',
            ], 400);
        }

        if ($plan->only_new_users && $user->subscriptions()->exists()) {
            return response()->json([
                'message' => 'Esta oferta es solo para nuevos usuarios.',
            ], 400);
        }

        $finalPrice = $this->finalPrice($plan);

        if ($plan->price_type === 'coins') {
            if ($user->coins < $finalPrice) {
                return response()->json([
                    'message' => 'No tienes monedas suficientes.',
                ], 400);
            }

            DB::transaction(function () use ($user, $plan, $finalPrice) {
                $user->decrement('coins', (int) $finalPrice);
                $this->createSubscription($user, $plan, 'coins', $finalPrice);
            });
        } elseif ($plan->price_type === 'free') {
            DB::transaction(function () use ($user, $plan) {
                $this->createSubscription($user, $plan, 'free', 0);
            });
        } else {
            return response()->json([
                'message' => 'Este plan requiere pago manual en soles.',
                'requires_manual_payment' => true,
            ], 402);
        }

        return response()->json([
            'message' => 'Suscripción activada correctamente.',
            'user' => $user->fresh(),
            'subscription' => $user->subscriptions()->latest()->first(),
        ]);
    }

    private function createSubscription($user, Plan $plan, string $paidWith, float $amount)
    {
        $user->subscriptions()
            ->where('status', 'active')
            ->update(['status' => 'expired']);

        $startsAt = now();

        $expiresAt = $this->addDuration(
            $startsAt,
            (int) ($plan->duration_value ?? 30),
            $plan->duration_unit ?: 'days'
        );

        return Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'plan_slug' => $plan->slug,
            'plan_name' => $plan->name,

            'status' => 'active',
            'starts_at' => $startsAt,
            'expires_at' => $expiresAt,

            'paid_with' => $paidWith,
            'amount_paid' => $amount,
            'plan_price' => $plan->price_amount ?? 0,

            'duration_value' => $plan->duration_value ?? 30,
            'duration_unit' => $plan->duration_unit ?: 'days',

            'page_duration_value' => $plan->page_duration_value ?? 30,
            'page_duration_unit' => $plan->page_duration_unit ?: 'days',

            'max_pages_per_day' => $plan->max_pages_per_day ?? 2,
            'pages_per_day' => $plan->max_pages_per_day ?? 2,

            'max_pages' => $plan->max_pages ?? 2,

            'access_level' => $plan->access_level ?? 'free',

            'subscription_duration_value' => $plan->duration_value ?? 30,
            'subscription_duration_unit' => $plan->duration_unit ?: 'days',

            'admin_retention_days' => $plan->admin_retention_days ?? 3,
        ]);
    }

    private function finalPrice(Plan $plan)
    {
        $price = (float) $plan->price_amount;

        if (
            $plan->discount_percent > 0 &&
            $plan->discount_ends_at &&
            now()->lessThan($plan->discount_ends_at)
        ) {
            $price = $price - ($price * ($plan->discount_percent / 100));
        }

        return max($price, 0);
    }

    private function isSoldOutThisMonth(Plan $plan)
    {
        if (! $plan->monthly_limit) {
            return false;
        }

        $used = Subscription::where('plan_id', $plan->id)
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();

        return $used >= $plan->monthly_limit;
    }

    private function withUsage(Plan $plan)
    {
        $used = Subscription::where('plan_id', $plan->id)
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();

        $plan->final_price = $this->finalPrice($plan);
        $plan->monthly_used = $used;
        $plan->monthly_available = $plan->monthly_limit
            ? max($plan->monthly_limit - $used, 0)
            : null;

        $plan->is_sold_out_this_month = $plan->monthly_limit
            ? $used >= $plan->monthly_limit
            : false;

        return $plan;
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
