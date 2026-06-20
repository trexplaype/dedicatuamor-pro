<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('templates')) {
            Schema::create('templates', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('description')->nullable();
                $table->integer('price_coins')->default(0);
                $table->boolean('is_free')->default(false);
                $table->string('preview_image')->nullable();
                $table->longText('html_content')->nullable();
                $table->json('fields_json')->nullable();
                $table->string('status')->default('active');
                $table->timestamps();
            });

            return;
        }

        Schema::table('templates', function (Blueprint $table) {
            if (! Schema::hasColumn('templates', 'preview_image')) {
                $table->string('preview_image')->nullable()->after('price_coins');
            }

            if (! Schema::hasColumn('templates', 'html_content')) {
                $table->longText('html_content')->nullable()->after('preview_image');
            }

            if (! Schema::hasColumn('templates', 'fields_json')) {
                $table->json('fields_json')->nullable()->after('html_content');
            }

            if (! Schema::hasColumn('templates', 'status')) {
                $table->string('status')->default('active')->after('fields_json');
            }
        });
    }

    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropColumn([
                'preview_image',
                'html_content',
                'fields_json',
                'status',
            ]);
        });
    }
};
