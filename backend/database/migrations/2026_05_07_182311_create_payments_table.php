<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {

            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade');

            $table->string('type');
            // coins | subscription | template

            $table->string('method');
            // culqi | mercadopago | yape_manual

            $table->string('status')
                ->default('pending');
            // pending | paid | rejected

            $table->decimal('amount', 10, 2)
                ->default(0);

            $table->integer('coins')
                ->nullable();

            $table->unsignedBigInteger('template_id')
                ->nullable();

            $table->string('plan_name')
                ->nullable();

            $table->string('operation_number')
                ->nullable();

            $table->string('proof_image')
                ->nullable();

            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
