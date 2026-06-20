<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('templates', function (Blueprint $table) {
            $table->id();

            $table->string('name')->nullable();
            $table->string('title')->nullable();

            $table->string('slug')->unique();
            $table->string('category')->nullable();
            $table->string('image')->nullable();

            $table->text('description')->nullable();

            $table->integer('price_coins')->default(50);
            $table->boolean('is_free')->default(false);

            $table->string('previewClass')->nullable();
            $table->string('symbol')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('templates');
    }
};
