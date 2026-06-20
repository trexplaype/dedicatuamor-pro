<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_pages', function (Blueprint $table) {
            if (! Schema::hasColumn('user_pages', 'plan_id')) {
                $table->unsignedBigInteger('plan_id')
                    ->nullable()
                    ->after('user_template_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_pages', function (Blueprint $table) {
            if (Schema::hasColumn('user_pages', 'plan_id')) {
                $table->dropColumn('plan_id');
            }
        });
    }
};
