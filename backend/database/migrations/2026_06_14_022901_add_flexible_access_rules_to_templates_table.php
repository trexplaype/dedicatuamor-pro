<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->string('access_level')->default('premium')->after('category');
            $table->boolean('allow_free_initial_use')->default(true)->after('access_level');
            $table->integer('free_initial_page_limit')->default(2)->after('allow_free_initial_use');

            $table->boolean('allow_individual_purchase')->default(true)->after('free_initial_page_limit');
            $table->integer('individual_price_coins')->default(0)->after('allow_individual_purchase');

            $table->boolean('requires_subscription')->default(false)->after('individual_price_coins');
            $table->string('minimum_subscription_level')->nullable()->after('requires_subscription');
        });
    }

    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropColumn([
                'access_level',
                'allow_free_initial_use',
                'free_initial_page_limit',
                'allow_individual_purchase',
                'individual_price_coins',
                'requires_subscription',
                'minimum_subscription_level',
            ]);
        });
    }
};
