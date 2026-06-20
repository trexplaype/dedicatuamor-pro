<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            if (! Schema::hasColumn('templates', 'allow_custom_link')) {
                $table->boolean('allow_custom_link')
                    ->default(false)
                    ->after('use_default_assets');
            }

            if (! Schema::hasColumn('templates', 'allow_custom_qr')) {
                $table->boolean('allow_custom_qr')
                    ->default(false)
                    ->after('allow_custom_link');
            }
        });
    }

    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            if (Schema::hasColumn('templates', 'allow_custom_qr')) {
                $table->dropColumn('allow_custom_qr');
            }

            if (Schema::hasColumn('templates', 'allow_custom_link')) {
                $table->dropColumn('allow_custom_link');
            }
        });
    }
};