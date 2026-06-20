<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_pages', function (Blueprint $table) {
            $table->string('slug_base')->nullable()->after('slug');
            $table->string('slug_suffix')->nullable()->after('slug_base');
        });
    }

    public function down(): void
    {
        Schema::table('user_pages', function (Blueprint $table) {
            $table->dropColumn([
                'slug_base',
                'slug_suffix',
            ]);
        });
    }
};