<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            if (! Schema::hasColumn('plans', 'duration_value')) {
                $table->integer('duration_value')->default(30)->after('price_amount');
            }

            if (! Schema::hasColumn('plans', 'duration_unit')) {
                $table->string('duration_unit')->default('days')->after('duration_value');
            }

            if (! Schema::hasColumn('plans', 'page_duration_value')) {
                $table->integer('page_duration_value')->default(30)->after('duration_unit');
            }

            if (! Schema::hasColumn('plans', 'page_duration_unit')) {
                $table->string('page_duration_unit')->default('days')->after('page_duration_value');
            }

            if (! Schema::hasColumn('plans', 'max_pages_per_day')) {
                $table->integer('max_pages_per_day')->default(2)->after('page_duration_unit');
            }
        });

        Schema::table('templates', function (Blueprint $table) {
            if (! Schema::hasColumn('templates', 'access_duration_value')) {
                $table->integer('access_duration_value')->default(30)->after('price_coins');
            }

            if (! Schema::hasColumn('templates', 'access_duration_unit')) {
                $table->string('access_duration_unit')->default('days')->after('access_duration_value');
            }

            if (! Schema::hasColumn('templates', 'page_duration_value')) {
                $table->integer('page_duration_value')->default(30)->after('access_duration_unit');
            }

            if (! Schema::hasColumn('templates', 'page_duration_unit')) {
                $table->string('page_duration_unit')->default('days')->after('page_duration_value');
            }
        });

        Schema::table('user_templates', function (Blueprint $table) {
            if (! Schema::hasColumn('user_templates', 'purchased_at')) {
                $table->timestamp('purchased_at')->nullable()->after('template_id');
            }

            if (! Schema::hasColumn('user_templates', 'expires_at')) {
                $table->timestamp('expires_at')->nullable()->after('purchased_at');
            }
        });

        Schema::table('user_pages', function (Blueprint $table) {
            if (! Schema::hasColumn('user_pages', 'expires_at')) {
                $table->timestamp('expires_at')->nullable()->after('published_at');
            }

            if (! Schema::hasColumn('user_pages', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn([
                'duration_value',
                'duration_unit',
                'page_duration_value',
                'page_duration_unit',
                'max_pages_per_day',
            ]);
        });

        Schema::table('templates', function (Blueprint $table) {
            $table->dropColumn([
                'access_duration_value',
                'access_duration_unit',
                'page_duration_value',
                'page_duration_unit',
            ]);
        });
    }
};
