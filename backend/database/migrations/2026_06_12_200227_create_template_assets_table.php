<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('template_assets', function (Blueprint $table) {
            $table->id();

            $table->foreignId('template_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->enum('type', [
                'image',
                'audio',
                'video',
                'background',
                'icon',
            ]);

            $table->string('name')->nullable();

            $table->text('url')->nullable();

            $table->string('file_path')->nullable();

            $table->integer('sort_order')->default(0);

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('template_assets');
    }
};
