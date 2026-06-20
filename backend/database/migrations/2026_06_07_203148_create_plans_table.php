<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();

            $table->string('price_type')->default('coins');
            $table->decimal('price_amount', 10, 2)->default(0);

            $table->integer('duration_days')->default(30);
            $table->string('access_level')->default('free');

            $table->boolean('is_active')->default(true);

            $table->integer('monthly_limit')->nullable();

            $table->integer('discount_percent')->default(0);
            $table->timestamp('discount_ends_at')->nullable();
            $table->boolean('only_new_users')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
