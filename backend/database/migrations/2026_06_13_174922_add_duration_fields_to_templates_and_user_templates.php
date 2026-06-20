<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_templates', function (Blueprint $table) {
            if (! Schema::hasColumn('user_templates', 'price_paid')) {
                $table->integer('price_paid')->default(0)->after('expires_at');
            }

            if (! Schema::hasColumn('user_templates', 'access_duration_value')) {
                $table->integer('access_duration_value')->default(30)->after('price_paid');
            }

            if (! Schema::hasColumn('user_templates', 'access_duration_unit')) {
                $table->string('access_duration_unit')->default('days')->after('access_duration_value');
            }

            if (! Schema::hasColumn('user_templates', 'page_duration_value')) {
                $table->integer('page_duration_value')->default(30)->after('access_duration_unit');
            }

            if (! Schema::hasColumn('user_templates', 'page_duration_unit')) {
                $table->string('page_duration_unit')->default('days')->after('page_duration_value');
            }
        });
    }

    public function down(): void
    {
        // No eliminar columnas para evitar perder datos reales.
    }
};
