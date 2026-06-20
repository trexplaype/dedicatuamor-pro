<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_pages', function (Blueprint $table) {
            if (! Schema::hasColumn('user_pages', 'content')) {
                $table->longText('content')->nullable()->after('template_title');
            }

            if (! Schema::hasColumn('user_pages', 'data_json')) {
                $table->json('data_json')->nullable()->after('content');
            }

            if (! Schema::hasColumn('user_pages', 'is_published')) {
                $table->boolean('is_published')->default(false)->after('data_json');
            }

            if (! Schema::hasColumn('user_pages', 'status')) {
                $table->string('status')->default('draft')->after('is_published');
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_pages', function (Blueprint $table) {
            if (Schema::hasColumn('user_pages', 'content')) {
                $table->dropColumn('content');
            }

            if (Schema::hasColumn('user_pages', 'data_json')) {
                $table->dropColumn('data_json');
            }

            if (Schema::hasColumn('user_pages', 'is_published')) {
                $table->dropColumn('is_published');
            }

            if (Schema::hasColumn('user_pages', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
