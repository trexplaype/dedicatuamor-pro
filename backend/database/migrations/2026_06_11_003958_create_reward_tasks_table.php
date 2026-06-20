<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reward_tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('type')->default('ads'); // ads, whatsapp_invite
            $table->integer('target_count')->default(1);
            $table->integer('reward_coins')->default(0);
            $table->integer('duration_seconds')->default(30);
            $table->boolean('is_daily')->default(true);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reward_tasks');
    }
};
