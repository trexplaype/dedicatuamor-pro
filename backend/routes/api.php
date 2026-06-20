<?php

use App\Http\Controllers\Admin\AdminAnalyticsController;
use App\Http\Controllers\Admin\AdminLinkOptionController;
use App\Http\Controllers\Admin\AdminPlanController;
use App\Http\Controllers\Admin\AdminPublishedPageController;
use App\Http\Controllers\Admin\AdminPurchasedTemplateController;
use App\Http\Controllers\Admin\AdminQrStyleController;
use App\Http\Controllers\Admin\AdminRewardTaskController;
use App\Http\Controllers\Admin\AdminSettingController;
use App\Http\Controllers\Admin\AdminSubscriptionController;
use App\Http\Controllers\Admin\AdminTemplateCategoryController;
use App\Http\Controllers\Admin\AdminTemplateController;
use App\Http\Controllers\Admin\AdminTemplateZipImportController;
use App\Http\Controllers\Admin\AdminUserPageController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PagePublishController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\RewardAdController;
use App\Http\Controllers\RewardController;
use App\Http\Controllers\RewardTaskController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\TemplatePurchaseController;
use App\Http\Controllers\UserPageAssetController;
use App\Http\Controllers\UserPageController;
use App\Http\Controllers\PublicPageController;
use App\Models\Setting;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

Route::post('/register', [
    AuthController::class,
    'register',
]);

Route::post('/login', [
    AuthController::class,
    'login',
]);

Route::get('/templates', [
    TemplateController::class,
    'index',
]);

Route::get('/plans', [
    PlanController::class,
    'index',
]);

Route::get('/settings', function () {
    return Setting::first();
});

Route::get('/p/{slug}', [
    UserPageController::class,
    'publicPage',
]);

// LEGACY

Route::get('/p/{slug}/link/{publicLink}', [
    PublicPageController::class,
    'showWithLink',
]);


/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {

        $user = $request->user();

        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->latest()
            ->first();

        return response()->json([
            ...$user->toArray(),

            'active_plan' => $subscription?->access_level ?? 'free',
            'plan_slug' => $subscription?->plan_slug ?? 'free',

            'active_subscription' => $subscription,
            'subscription' => $subscription,
        ]);
    });

    /*
    |--------------------------------------------------------------------------
    | TEMPLATE PURCHASES
    |--------------------------------------------------------------------------
    */

    Route::post('/templates/{template}/purchase', [
        TemplatePurchaseController::class,
        'purchase',
    ]);

    Route::get('/my-templates', [
        TemplatePurchaseController::class,
        'myTemplates',
    ]);

    /*
    |--------------------------------------------------------------------------
    | USER PAGES
    |--------------------------------------------------------------------------
    */

    Route::get('/user-pages', [
        UserPageController::class,
        'index',
    ]);

    Route::get('/my-pages', [
        UserPageController::class,
        'myPages',
    ]);

    Route::post('/templates/{template}/pages', [
        UserPageController::class,
        'store',
    ]);

    Route::post('/templates/{template}/create-page', [
        UserPageController::class,
        'createFromTemplate',
    ]);

    Route::get('/user-pages/{userPage}', [
        UserPageController::class,
        'show',
    ]);

    Route::get('/pages/{page}/editor', [
        UserPageController::class,
        'showEditor',
    ]);

    Route::get('/user-pages/{page}/permissions', [
    UserPageController::class,
    'permissions',
    ]);

    Route::put('/user-pages/{userPage}', [
        UserPageController::class,
        'update',
    ]);

    Route::put('/pages/{page}', [
        UserPageController::class,
        'updatePage',
    ]);

    /*
    |--------------------------------------------------------------------------
    | USER PAGE ASSETS
    |--------------------------------------------------------------------------
    */

    Route::get('/user-pages/{page}/assets', [
        UserPageAssetController::class,
        'index',
    ]);

    Route::post('/user-pages/{page}/assets', [
        UserPageAssetController::class,
        'store',
    ]);

    Route::delete('/user-page-assets/{asset}', [
        UserPageAssetController::class,
        'destroy',
    ]);

    Route::get('/pages/check-slug', [
    PagePublishController::class,
    'checkSlug',
    ]);

    Route::post('/pages/{page}/publish', [
        PagePublishController::class,
        'publish',
    ]);

    Route::get('/pages/{page}/available-links', [
        PagePublishController::class,
        'availableLinks',
    ]);

    Route::get('/pages/{page}/available-qr-styles', [
        PagePublishController::class,
        'availableQrStyles',
    ]);

    /*
    |--------------------------------------------------------------------------
    | SUBSCRIPTIONS / PLANS
    |--------------------------------------------------------------------------
    */

    Route::post('/plans/{plan}/subscribe', [
        PlanController::class,
        'subscribe',
    ]);

    Route::post('/subscriptions/activate', [
        SubscriptionController::class,
        'activate',
    ]);

    /*
    |--------------------------------------------------------------------------
    | PAYMENTS
    |--------------------------------------------------------------------------
    */

    Route::post('/payments/manual/coins', [
        PaymentController::class,
        'manualCoins',
    ]);

    Route::post('/payments/manual-coins', [
        PaymentController::class,
        'manualCoins',
    ]);

    Route::get('/payments/my-payments', [
        PaymentController::class,
        'myPayments',
    ]);

    /*
    |--------------------------------------------------------------------------
    | REWARDS
    |--------------------------------------------------------------------------
    */

    Route::post('/rewards/claim', [
        RewardController::class,
        'claim',
    ]);

    Route::get('/reward-tasks', [
        RewardTaskController::class,
        'index',
    ]);

    Route::post('/reward-tasks/{rewardTask}/progress', [
        RewardTaskController::class,
        'addProgress',
    ]);

    /*
    |--------------------------------------------------------------------------
    | REWARDED ADS
    |--------------------------------------------------------------------------
    */

    Route::post('/rewards/ads/start', [
        RewardAdController::class,
        'start',
    ]);

    Route::post('/rewards/ads/claim', [
        RewardAdController::class,
        'claim',
    ]);

    Route::post('/rewards/ads/cancel', [
        RewardAdController::class,
        'cancel',
    ]);

    /*
    |--------------------------------------------------------------------------
    | ADMIN ONLY
    |--------------------------------------------------------------------------
    */

    Route::middleware('admin')->prefix('admin')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | ADMIN DASHBOARD / ANALYTICS
        |--------------------------------------------------------------------------
        */

        Route::get('/dashboard', [
            PaymentController::class,
            'dashboard',
        ]);

        Route::get('/analytics', [
            AdminAnalyticsController::class,
            'index',
        ]);

        Route::get('/users', [
            PaymentController::class,
            'users',
        ]);

        /*
        |--------------------------------------------------------------------------
        | ADMIN PAYMENTS
        |--------------------------------------------------------------------------
        */

        Route::get('/payments/pending', [
            PaymentController::class,
            'pendingPayments',
        ]);

        Route::get('/payments/approved', [
            PaymentController::class,
            'approvedPayments',
        ]);

        Route::get('/payments/rejected', [
            PaymentController::class,
            'rejectedPayments',
        ]);

        Route::get('/payments/expired', [
            PaymentController::class,
            'expiredPayments',
        ]);

        Route::post('/payments/{payment}/approve', [
            PaymentController::class,
            'approvePayment',
        ]);

        Route::post('/payments/{payment}/reject', [
            PaymentController::class,
            'rejectPayment',
        ]);

        /*
        |--------------------------------------------------------------------------
        | ADMIN TEMPLATES
        |--------------------------------------------------------------------------
        */

        Route::get('/purchased-templates', [
            AdminPurchasedTemplateController::class,

            'index',
        ]);

        Route::get('/purchased-templates/{purchase}', [
            AdminPurchasedTemplateController::class,
            'show',
        ]);

        Route::get('/templates', [
            AdminTemplateController::class,
            'index',
        ]);

        Route::post('/templates', [
            AdminTemplateController::class,
            'store',
        ]);

        Route::post('/templates/import-zip', [
            AdminTemplateZipImportController::class,
            'store',
        ]);

        Route::get('/templates/{template}', [
            AdminTemplateController::class,
            'show',
        ]);

        Route::put('/templates/{template}', [
            AdminTemplateController::class,
            'update',
        ]);

        Route::delete('/templates/{template}', [
            AdminTemplateController::class,
            'destroy',
        ]);

        /*
        |--------------------------------------------------------------------------
        | ADMIN TEMPLATE CATEGORIES
        |--------------------------------------------------------------------------
        */

        Route::get('/template-categories', [
            AdminTemplateCategoryController::class,
            'index',
        ]);

        Route::post('/template-categories', [
            AdminTemplateCategoryController::class,
            'store',
        ]);

        Route::get('/template-categories/{category}', [
            AdminTemplateCategoryController::class,
            'show',
        ]);

        Route::put('/template-categories/{category}', [
            AdminTemplateCategoryController::class,
            'update',
        ]);

        Route::delete('/template-categories/{category}', [
            AdminTemplateCategoryController::class,
            'destroy',
        ]);

        /*
        |--------------------------------------------------------------------------
        | ADMIN PLANS
        |--------------------------------------------------------------------------
        */

        Route::get('/plans', [
            AdminPlanController::class,
            'index',
        ]);

        Route::post('/plans', [
            AdminPlanController::class,
            'store',
        ]);

        Route::get('/plans/{plan}', [
            AdminPlanController::class,
            'show',
        ]);

        Route::put('/plans/{plan}', [
            AdminPlanController::class,
            'update',
        ]);

        Route::delete('/plans/{plan}', [
            AdminPlanController::class,
            'destroy',
        ]);

        /*
        |--------------------------------------------------------------------------
        | ADMIN REWARDS
        |--------------------------------------------------------------------------
        */

        Route::get('/reward-tasks', [
            AdminRewardTaskController::class,
            'index',
        ]);

        Route::post('/reward-tasks', [
            AdminRewardTaskController::class,
            'store',
        ]);

        Route::put('/reward-tasks/{rewardTask}', [
            AdminRewardTaskController::class,
            'update',
        ]);

        Route::delete('/reward-tasks/{rewardTask}', [
            AdminRewardTaskController::class,
            'destroy',
        ]);

        /*
        |--------------------------------------------------------------------------
        | ADMIN SETTINGS
        |--------------------------------------------------------------------------
        */

        Route::get('/settings', [
            AdminSettingController::class,
            'show',
        ]);

        Route::put('/settings', [
            AdminSettingController::class,
            'update',
        ]);

        /*
        |--------------------------------------------------------------------------
        | ADMIN LINK OPTIONS
        |--------------------------------------------------------------------------
        */

        Route::get('/link-options', [
            AdminLinkOptionController::class,
            'index',
        ]);
        Route::post('/link-options', [
            AdminLinkOptionController::class,
            'store',
        ]);
        Route::get('/link-options/{linkOption}', [
            AdminLinkOptionController::class,
            'show',
        ]);
        Route::put('/link-options/{linkOption}', [
            AdminLinkOptionController::class,
            'update',
        ]);
        Route::delete('/link-options/{linkOption}', [
            AdminLinkOptionController::class,
            'destroy',
        ]);

        /*
        |--------------------------------------------------------------------------
        | ADMIN QR STYLES
        |--------------------------------------------------------------------------
        */

        Route::get('/qr-styles', [
            AdminQrStyleController::class,
            'index',
        ]);
        Route::post('/qr-styles', [
            AdminQrStyleController::class,
            'store',
        ]);
        Route::get('/qr-styles/{qrStyle}', [
            AdminQrStyleController::class,
            'show',
        ]);
        Route::put('/qr-styles/{qrStyle}', [
            AdminQrStyleController::class,
            'update',
        ]);
        Route::delete('/qr-styles/{qrStyle}', [
            AdminQrStyleController::class,
            'destroy',
        ]);

        /*
        |--------------------------------------------------------------------------
        | ADMIN PUBLISHED PAGES
        |--------------------------------------------------------------------------
        */

        Route::get('/published-pages', [
            AdminPublishedPageController::class,
            'index',
        ]);
        Route::get('/published-pages/{userPage}', [
            AdminPublishedPageController::class,
            'show',
        ]);
        Route::put('/published-pages/{userPage}', [
            AdminPublishedPageController::class,
            'update',
        ]);
        Route::delete('/published-pages/{userPage}', [
            AdminPublishedPageController::class,
            'destroy',
        ]);

        /*
        |--------------------------------------------------------------------------
        | ADMIN USER PAGES
        |--------------------------------------------------------------------------
        */

        Route::get('/user-pages', [
            AdminUserPageController::class,
            'index',
        ]);

        Route::post('/user-pages/{page}/restore', [
            AdminUserPageController::class,
            'restore',
        ]);

        Route::post('/user-pages/{page}/extend', [
            AdminUserPageController::class,
            'extend',
        ]);

        Route::delete('/user-pages/{page}', [
            AdminUserPageController::class,
            'destroy',
        ]);

        /*
        |--------------------------------------------------------------------------
        | ADMIN SUBSCRIPTIONS
        |--------------------------------------------------------------------------
        */

        Route::get('/subscriptions', [
            AdminSubscriptionController::class,
            'index',
        ]);
        Route::get('/subscriptions/{subscription}', [
            AdminSubscriptionController::class,
            'show',
        ]);
        Route::put('/subscriptions/{subscription}', [
            AdminSubscriptionController::class,
            'update',
        ]);
        Route::delete('/subscriptions/{subscription}', [
            AdminSubscriptionController::class,
            'destroy',
        ]);

    });
});
