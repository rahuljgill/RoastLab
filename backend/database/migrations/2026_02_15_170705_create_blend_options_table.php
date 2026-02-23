<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blend_options', function (Blueprint $table) {
            $table->id();

            // roast | grind | size | extra
            $table->string('type');

            $table->string('name');

            $table->string('code')->nullable();

            $table->decimal('price_delta', 10, 2)->default(0);

            $table->json('meta')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();

   
            $table->unique(['type', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blend_options');
    }
};