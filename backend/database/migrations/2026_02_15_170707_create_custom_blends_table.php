<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_blends', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade');

            $table->string('name')->nullable();


            $table->string('origin')->nullable();

            $table->foreignId('roast_option_id')
                ->constrained('blend_options')
                ->restrictOnDelete();

            $table->foreignId('grind_option_id')
                ->constrained('blend_options')
                ->restrictOnDelete();

            $table->foreignId('size_option_id')
                ->constrained('blend_options')
                ->restrictOnDelete();

            // Extras as an array of option IDs, e.g. [12, 15]
            $table->json('extras')->nullable();

           
            $table->decimal('price_total', 10, 2);

            $table->text('description')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_blends');
    }
};