<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_page_assets', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable()
                ->after('id')
                ->constrained()
                ->nullOnDelete();

            $table->string('file_name')
                ->nullable()
                ->after('file_path');

            $table->string('mime_type')
                ->nullable()
                ->after('file_name');

            $table->unsignedBigInteger('file_size')
                ->nullable()
                ->after('mime_type');
        });
    }

    public function down(): void
    {
        Schema::table('user_page_assets', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn([
                'file_name',
                'mime_type',
                'file_size',
            ]);
        });
    }
};
