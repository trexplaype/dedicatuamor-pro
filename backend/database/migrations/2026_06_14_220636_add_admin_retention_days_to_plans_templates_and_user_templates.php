<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('plans', 'admin_retention_days')) {
            Schema::table('plans', function (Blueprint $table) {
                $table->integer('admin_retention_days')->default(3)->after('page_duration_unit');
            });
        }

        if (! Schema::hasColumn('templates', 'admin_retention_days')) {
            Schema::table('templates', function (Blueprint $table) {
                $table->integer('admin_retention_days')->default(3)->after('page_duration_unit');
            });
        }

        if (! Schema::hasColumn('user_templates', 'admin_retention_days')) {
            Schema::table('user_templates', function (Blueprint $table) {
                $table->integer('admin_retention_days')->default(3)->after('page_duration_unit');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('user_templates', 'admin_retention_days')) {
            Schema::table('user_templates', function (Blueprint $table) {
                $table->dropColumn('admin_retention_days');
            });
        }

        if (Schema::hasColumn('templates', 'admin_retention_days')) {
            Schema::table('templates', function (Blueprint $table) {
                $table->dropColumn('admin_retention_days');
            });
        }

        if (Schema::hasColumn('plans', 'admin_retention_days')) {
            Schema::table('plans', function (Blueprint $table) {
                $table->dropColumn('admin_retention_days');
            });
        }
    }
};
