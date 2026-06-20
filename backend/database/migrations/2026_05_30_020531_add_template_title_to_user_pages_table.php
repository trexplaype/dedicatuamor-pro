<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_pages', function (Blueprint $table) {
            $table->string('template_title')->nullable()->after('template_id');
        });
    }

    public function down(): void
    {
        Schema::table('user_pages', function (Blueprint $table) {
            $table->dropColumn('template_title');
        });
    }
};
