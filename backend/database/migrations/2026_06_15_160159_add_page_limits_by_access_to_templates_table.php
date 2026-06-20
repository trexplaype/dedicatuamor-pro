<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->unsignedInteger('max_pages_by_plan')->default(5)->after('price_coins');
            $table->unsignedInteger('max_pages_by_purchase')->default(5)->after('max_pages_by_plan');
        });
    }

    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropColumn([
                'max_pages_by_plan',
                'max_pages_by_purchase',
            ]);
        });
    }
};
