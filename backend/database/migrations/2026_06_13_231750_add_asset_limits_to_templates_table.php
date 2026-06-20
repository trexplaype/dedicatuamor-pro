<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('templates', function (Blueprint $table) {

            $table->boolean('allow_upload_assets')->default(false);

            $table->boolean('allow_external_assets')->default(false);

            $table->integer('max_upload_images')->default(0);
            $table->integer('max_upload_music')->default(0);
            $table->integer('max_upload_videos')->default(0);
            $table->integer('max_upload_audios')->default(0);
            $table->integer('max_upload_files')->default(0);

            $table->integer('max_external_images')->default(0);
            $table->integer('max_external_music')->default(0);
            $table->integer('max_external_videos')->default(0);
            $table->integer('max_external_audios')->default(0);
            $table->integer('max_external_files')->default(0);

            $table->boolean('use_default_assets')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {

            $table->dropColumn([
                'allow_upload_assets',
                'allow_external_assets',

                'max_upload_images',
                'max_upload_music',
                'max_upload_videos',
                'max_upload_audios',
                'max_upload_files',

                'max_external_images',
                'max_external_music',
                'max_external_videos',
                'max_external_audios',
                'max_external_files',

                'use_default_assets',
            ]);
        });
    }
};
