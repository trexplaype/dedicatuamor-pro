<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_page_assets', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_page_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->enum('type', [
                'image',
                'video',
                'audio',
            ]);

            $table->string('source_type')->default('url');
            // url | upload

            $table->string('title')->nullable();

            $table->text('url')->nullable();

            $table->string('file_path')->nullable();

            $table->integer('sort_order')->default(0);

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_page_assets');
    }
};
