<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {

            if (! Schema::hasColumn('subscriptions', 'plan_name')) {
                $table->string('plan_name')->nullable()->after('plan_slug');
            }

            if (! Schema::hasColumn('subscriptions', 'plan_price')) {
                $table->decimal('plan_price', 10, 2)->default(0);
            }

            if (! Schema::hasColumn('subscriptions', 'duration_value')) {
                $table->integer('duration_value')->default(30);
            }

            if (! Schema::hasColumn('subscriptions', 'duration_unit')) {
                $table->string('duration_unit')->default('days');
            }

            if (! Schema::hasColumn('subscriptions', 'page_duration_value')) {
                $table->integer('page_duration_value')->default(30);
            }

            if (! Schema::hasColumn('subscriptions', 'page_duration_unit')) {
                $table->string('page_duration_unit')->default('days');
            }

            if (! Schema::hasColumn('subscriptions', 'max_pages_per_day')) {
                $table->integer('max_pages_per_day')->default(2);
            }

            if (! Schema::hasColumn('subscriptions', 'access_level')) {
                $table->string('access_level')->nullable();
            }
        });

        Schema::table('user_templates', function (Blueprint $table) {

            if (! Schema::hasColumn('user_templates', 'price_paid')) {
                $table->integer('price_paid')->default(0);
            }

            if (! Schema::hasColumn('user_templates', 'access_duration_value')) {
                $table->integer('access_duration_value')->default(30);
            }

            if (! Schema::hasColumn('user_templates', 'access_duration_unit')) {
                $table->string('access_duration_unit')->default('days');
            }

            if (! Schema::hasColumn('user_templates', 'page_duration_value')) {
                $table->integer('page_duration_value')->default(30);
            }

            if (! Schema::hasColumn('user_templates', 'page_duration_unit')) {
                $table->string('page_duration_unit')->default('days');
            }

        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {

            $table->dropColumn([
                'plan_name',
                'plan_price',
                'duration_value',
                'duration_unit',
                'page_duration_value',
                'page_duration_unit',
                'max_pages_per_day',
                'access_level',
            ]);

        });

        Schema::table('user_templates', function (Blueprint $table) {

            $table->dropColumn([
                'price_paid',
                'access_duration_value',
                'access_duration_unit',
                'page_duration_value',
                'page_duration_unit',
            ]);

        });
    }
};
