<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_pages', function (Blueprint $table) {
            if (! Schema::hasColumn('user_pages', 'user_template_id')) {
                $table->unsignedBigInteger('user_template_id')
                    ->nullable()
                    ->after('template_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_pages', function (Blueprint $table) {
            if (Schema::hasColumn('user_pages', 'user_template_id')) {
                $table->dropColumn('user_template_id');
            }
        });
    }
};
