<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_pages', function (Blueprint $table) {
            $table->foreignId('link_option_id')
                ->nullable()
                ->after('public_url')
                ->constrained('link_options')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('user_pages', function (Blueprint $table) {
            $table->dropConstrainedForeignId('link_option_id');
        });
    }
};