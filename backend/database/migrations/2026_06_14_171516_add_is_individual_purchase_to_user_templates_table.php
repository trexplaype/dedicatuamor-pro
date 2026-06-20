<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_templates', function (Blueprint $table) {
            if (! Schema::hasColumn('user_templates', 'is_individual_purchase')) {
                $table->boolean('is_individual_purchase')
                    ->default(false)
                    ->after('price_paid');
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_templates', function (Blueprint $table) {
            if (Schema::hasColumn('user_templates', 'is_individual_purchase')) {
                $table->dropColumn('is_individual_purchase');
            }
        });
    }
};
