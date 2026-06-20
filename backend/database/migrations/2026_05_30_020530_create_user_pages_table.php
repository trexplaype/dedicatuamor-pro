<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('user_pages')) {
            Schema::table('user_pages', function (Blueprint $table) {
                if (! Schema::hasColumn('user_pages', 'data_json')) {
                    $table->json('data_json')->nullable();
                }

                if (! Schema::hasColumn('user_pages', 'slug')) {
                    $table->string('slug')->unique()->nullable();
                }

                if (! Schema::hasColumn('user_pages', 'title')) {
                    $table->string('title')->nullable();
                }
            });

            return;
        }

        Schema::create('user_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('template_id')->constrained('templates')->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->string('slug')->unique();
            $table->json('data_json')->nullable();
            $table->string('status')->default('published');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_pages');
    }
};
