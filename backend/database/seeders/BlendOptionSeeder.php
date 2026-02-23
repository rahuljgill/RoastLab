<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BlendOptionSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $rows = [
            // ROAST
            ['type' => 'roast', 'name' => 'Light Roast',  'code' => 'light',  'price_delta' => 0,    'meta' => null, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['type' => 'roast', 'name' => 'Medium Roast', 'code' => 'medium', 'price_delta' => 0,    'meta' => null, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['type' => 'roast', 'name' => 'Dark Roast',   'code' => 'dark',   'price_delta' => 0,    'meta' => null, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],

            // GRIND
            ['type' => 'grind', 'name' => 'Whole Bean',        'code' => 'whole_bean', 'price_delta' => 0, 'meta' => null, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['type' => 'grind', 'name' => 'Espresso Grind',    'code' => 'espresso',   'price_delta' => 0, 'meta' => null, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['type' => 'grind', 'name' => 'Filter / Pour Over','code' => 'filter',     'price_delta' => 0, 'meta' => null, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],

            // SIZE
            ['type' => 'size', 'name' => '250g', 'code' => '250g',  'price_delta' => 5.00,  'meta' => json_encode(['grams' => 250]),  'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['type' => 'size', 'name' => '500g', 'code' => '500g',  'price_delta' => 9.00,  'meta' => json_encode(['grams' => 500]),  'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['type' => 'size', 'name' => '1kg',  'code' => '1000g', 'price_delta' => 16.00, 'meta' => json_encode(['grams' => 1000]), 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],

            // EXTRAS
            ['type' => 'extra', 'name' => 'Decaf Option',       'code' => 'decaf',    'price_delta' => 1.50, 'meta' => null, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['type' => 'extra', 'name' => 'Vanilla Infusion',   'code' => 'vanilla',  'price_delta' => 2.00, 'meta' => null, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['type' => 'extra', 'name' => 'Hazelnut Infusion',  'code' => 'hazelnut', 'price_delta' => 2.00, 'meta' => null, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
        ];

        DB::table('blend_options')->upsert(
            $rows,
            ['type', 'name'], 
            ['code', 'price_delta', 'meta', 'is_active', 'updated_at'] 
        );
    }
}