<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_reward_task_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reward_task_id')->constrained('reward_tasks')->cascadeOnDelete();
            $table->integer('progress_count')->default(0);
            $table->date('reward_date');
            $table->timestamp('claimed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'reward_task_id', 'reward_date'], 'reward_progress_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_reward_task_progress');
    }
};
