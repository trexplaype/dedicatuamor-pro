<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE user_page_assets MODIFY type ENUM('image','video','audio','music','file') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE user_page_assets MODIFY type ENUM('image','video','audio') NOT NULL");
    }
};
