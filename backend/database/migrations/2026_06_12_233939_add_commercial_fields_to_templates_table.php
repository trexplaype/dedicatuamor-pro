<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->integer('discount_coins')->nullable()->after('price_coins');
            $table->json('access_plans')->nullable()->after('required_plan');
        });
    }

    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropColumn([
                'discount_coins',
                'access_plans',
            ]);
        });
    }
};
