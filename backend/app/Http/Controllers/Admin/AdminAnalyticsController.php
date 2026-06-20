<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Template;
use App\Models\User;
use App\Models\UserPage;
use Illuminate\Support\Facades\DB;

class AdminAnalyticsController extends Controller
{
    public function index()
    {
        $now = now();

        $usersCount = User::count();
        $templatesCount = Template::count();
        $pagesCount = UserPage::count();

        $approvedPayments = Payment::where('status', 'approved');

        $totalIncome = (clone $approvedPayments)->sum('amount');
        $coinsSold = (clone $approvedPayments)->sum('coins');

        $subscriptionsActive = Subscription::where('status', 'active')
            ->where('expires_at', '>', $now)
            ->count();

        $superUserPlan = Plan::where('slug', 'super-user')->first();

        $superUserMonthlyUsed = 0;
        $superUserMonthlyLimit = null;

        if ($superUserPlan) {
            $superUserMonthlyLimit = $superUserPlan->monthly_limit;

            $superUserMonthlyUsed = Subscription::where('plan_id', $superUserPlan->id)
                ->whereYear('created_at', $now->year)
                ->whereMonth('created_at', $now->month)
                ->count();
        }

        $plansStats = Subscription::select('plan_slug', DB::raw('COUNT(*) as total'))
            ->groupBy('plan_slug')
            ->orderByDesc('total')
            ->get();

        $templatesUsage = UserPage::select(
            'template_id',
            DB::raw('COUNT(*) as pages_count')
        )
            ->with('template:id,name,title,slug')
            ->groupBy('template_id')
            ->orderByDesc('pages_count')
            ->limit(10)
            ->get();

        $usersByDay = User::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as total')
        )
            ->where('created_at', '>=', $now->copy()->subDays(30))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        $paymentsByDay = Payment::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(amount) as total')
        )
            ->where('status', 'approved')
            ->where('created_at', '>=', $now->copy()->subDays(30))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        return response()->json([
            'summary' => [
                'users_count' => $usersCount,
                'templates_count' => $templatesCount,
                'pages_count' => $pagesCount,
                'subscriptions_active' => $subscriptionsActive,
                'total_income' => $totalIncome,
                'coins_sold' => $coinsSold,
                'super_user_monthly_used' => $superUserMonthlyUsed,
                'super_user_monthly_limit' => $superUserMonthlyLimit,
                'super_user_monthly_available' => $superUserMonthlyLimit
                    ? max($superUserMonthlyLimit - $superUserMonthlyUsed, 0)
                    : null,
            ],

            'plans_stats' => $plansStats,
            'templates_usage' => $templatesUsage,
            'users_by_day' => $usersByDay,
            'payments_by_day' => $paymentsByDay,
        ]);
    }
}
