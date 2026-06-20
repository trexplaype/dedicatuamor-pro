<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            if (! Schema::hasColumn('subscriptions', 'subscription_duration_value')) {
                $table->integer('subscription_duration_value')->default(30);
            }

            if (! Schema::hasColumn('subscriptions', 'subscription_duration_unit')) {
                $table->string('subscription_duration_unit')->default('days');
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

            if (! Schema::hasColumn('subscriptions', 'pages_per_day')) {
                $table->integer('pages_per_day')->default(2);
            }

            if (! Schema::hasColumn('subscriptions', 'active_pages_limit')) {
                $table->integer('active_pages_limit')->default(2);
            }

            if (! Schema::hasColumn('subscriptions', 'admin_retention_days')) {
                $table->integer('admin_retention_days')->default(3);
            }

            if (! Schema::hasColumn('subscriptions', 'access_level')) {
                $table->string('access_level')->default('free');
            }
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $columns = [
                'subscription_duration_value',
                'subscription_duration_unit',
                'page_duration_value',
                'page_duration_unit',
                'max_pages_per_day',
                'pages_per_day',
                'active_pages_limit',
                'admin_retention_days',
                'access_level',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('subscriptions', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
