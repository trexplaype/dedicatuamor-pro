<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_pages', function (Blueprint $table) {
            if (! Schema::hasColumn('user_pages', 'admin_retention_days')) {
                $table->integer('admin_retention_days')
                    ->default(3)
                    ->after('expires_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_pages', function (Blueprint $table) {
            if (Schema::hasColumn('user_pages', 'admin_retention_days')) {
                $table->dropColumn('admin_retention_days');
            }
        });
    }
};
