<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SubscriptionController extends Controller
{
    public function activate(Request $request)
    {
        $request->validate([
            'plan_slug' => 'required|string|exists:plans,slug',
        ]);

        $user = $request->user();

        $plan = Plan::where('slug', $request->plan_slug)
            ->where('is_active', true)
            ->firstOrFail();

        if ($plan->price_type === 'coins' && $user->coins < $plan->price_amount) {
            return response()->json([
                'message' => 'No tienes monedas suficientes.',
            ], 400);
        }

        return DB::transaction(function () use ($user, $plan) {
            if ($plan->price_type === 'coins' && $plan->price_amount > 0) {
                $user->decrement('coins', (int) $plan->price_amount);
            }

            Subscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->update(['status' => 'expired']);

            $startsAt = now();

            $expiresAt = $this->addDuration(
                $startsAt,
                (int) ($plan->duration_value ?? 30),
                $plan->duration_unit ?: 'days'
            );

            $data = [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'plan_slug' => $plan->slug,
                'plan_name' => $plan->name,

                'status' => 'active',
                'starts_at' => $startsAt,
                'expires_at' => $expiresAt,

                'paid_with' => $plan->price_type,
                'amount_paid' => $plan->price_amount ?? 0,
                'plan_price' => $plan->price_amount ?? 0,

                'duration_value' => $plan->duration_value ?? 30,
                'duration_unit' => $plan->duration_unit ?: 'days',

                'page_duration_value' => $plan->page_duration_value ?? 30,
                'page_duration_unit' => $plan->page_duration_unit ?: 'days',

                'max_pages_per_day' => $plan->max_pages_per_day ?? 2,
                'pages_per_day' => $plan->max_pages_per_day ?? 2,

                'access_level' => $plan->access_level ?? 'free',

                'subscription_duration_value' => $plan->duration_value ?? 30,
                'subscription_duration_unit' => $plan->duration_unit ?: 'days',

                'admin_retention_days' => $plan->admin_retention_days ?? 3,
            ];

            if (Schema::hasColumn('subscriptions', 'max_pages')) {
                $data['max_pages'] = $plan->max_pages ?? 2;
            }

            $subscription = Subscription::create($data);

            $freshUser = $user->fresh();

            return response()->json([
                'success' => true,
                'message' => 'Plan activado correctamente.',
                'subscription' => $subscription,
                'user' => $freshUser,
                'coins_left' => $freshUser->coins,
                'active_plan' => $subscription->access_level,
                'plan_slug' => $subscription->plan_slug,
                'plan_name' => $subscription->plan_name,
            ]);
        });
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
