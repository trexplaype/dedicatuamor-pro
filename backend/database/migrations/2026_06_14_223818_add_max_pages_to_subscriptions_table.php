<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {

            if (! Schema::hasColumn('subscriptions', 'max_pages')) {
                $table->integer('max_pages')
                    ->default(0)
                    ->after('pages_per_day');
            }

        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {

            if (Schema::hasColumn('subscriptions', 'max_pages')) {
                $table->dropColumn('max_pages');
            }

        });
    }
};
