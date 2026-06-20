<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('templates', function (Blueprint $table) {

            $table->string('preview_url')->nullable()->after('preview_image');

            $table->string('editor_url')->nullable()->after('preview_url');

            $table->string('source_zip_path')->nullable()->after('editor_url');

        });
    }

    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {

            $table->dropColumn([
                'preview_url',
                'editor_url',
                'source_zip_path',
            ]);

        });
    }
};
