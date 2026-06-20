<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddExpiresAtToUserTemplatesTable extends Migration
{
    public function up(): void
    {
        Schema::table('user_templates', function (Blueprint $table) {
            $table->timestamp('expires_at')->nullable()->after('purchased_at');
        });
    }

    public function down(): void
    {
        Schema::table('user_templates', function (Blueprint $table) {
            $table->dropColumn('expires_at');
        });
    }
}
