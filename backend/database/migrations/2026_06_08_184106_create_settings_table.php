<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | RECOMPENSAS
            |--------------------------------------------------------------------------
            */

            $table->integer('reward_ad_30')->default(10);
            $table->integer('reward_ad_60')->default(25);
            $table->integer('reward_whatsapp')->default(15);
            $table->integer('reward_invite_friend')->default(50);

            /*
            |--------------------------------------------------------------------------
            | PLANTILLAS
            |--------------------------------------------------------------------------
            */

            $table->integer('default_template_price')->default(50);

            /*
            |--------------------------------------------------------------------------
            | APP
            |--------------------------------------------------------------------------
            */

            $table->string('app_name')->default('DEV AGS');
            $table->string('admin_whatsapp')->nullable();

            /*
            |--------------------------------------------------------------------------
            | MONEDAS
            |--------------------------------------------------------------------------
            */

            $table->integer('coins_per_sol')->default(20);

            /*
            |--------------------------------------------------------------------------
            | PUBLICIDAD
            |--------------------------------------------------------------------------
            */

            $table->boolean('ads_enabled')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
