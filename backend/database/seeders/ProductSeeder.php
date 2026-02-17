<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Ethiopia Light Roast',
                'description' => 'Delicate and aromatic with bright floral top notes, a zesty citrus mid-palate, and a clean tea-like finish. Grown at 1,900m in the Yirgacheffe region.',
                'price' => 12.50,
                'image_url' => '/products/1.png',
                'roast_type' => 'Light',
                'origin' => 'Ethiopia',
                'stock' => 100,
                'is_active' => true,
            ],
            [
                'name' => 'Colombia Medium Roast',
                'description' => 'Silky smooth with a rich caramel sweetness and gentle nuttiness. Sourced from small farms in Huila, known for their consistently balanced, crowd-pleasing cup.',
                'price' => 13.00,
                'image_url' => '/products/2.png',
                'roast_type' => 'Medium',
                'origin' => 'Colombia',
                'stock' => 100,
                'is_active' => true,
            ],
            [
                'name' => 'Midnight Blend',
                'description' => 'Our signature dark roast — bold, brooding, and unapologetic. Deep dark chocolate, a hint of molasses, and a long low-acid finish that holds up beautifully in milk.',
                'price' => 14.50,
                'image_url' => '/products/3.png',
                'roast_type' => 'Dark',
                'origin' => 'House Blend',
                'stock' => 100,
                'is_active' => true,
            ],
            [
                'name' => 'Kenya AA',
                'description' => 'Vibrant and complex with a punchy blackcurrant character, juicy stone fruit acidity, and a sparkling bright finish. AA grade beans from the slopes of Mount Kenya.',
                'price' => 14.00,
                'image_url' => '/products/4.png',
                'roast_type' => 'Light / Medium',
                'origin' => 'Kenya',
                'stock' => 100,
                'is_active' => true,
            ],
            [
                'name' => 'Guatemala Antigua',
                'description' => 'Grown in volcanic soil at high altitude, this cup delivers warm cocoa, soft toffee, and a clean sweetness with a velvety body that lingers pleasantly.',
                'price' => 13.50,
                'image_url' => '/products/5.png',
                'roast_type' => 'Medium',
                'origin' => 'Guatemala',
                'stock' => 100,
                'is_active' => true,
            ],
            [
                'name' => 'Brazil Santos',
                'description' => 'Classic and comforting — roasted hazelnut, buttery caramel, and a round full body with very low acidity. An ideal everyday espresso base or blend anchor.',
                'price' => 12.75,
                'image_url' => '/products/6.png',
                'roast_type' => 'Medium / Dark',
                'origin' => 'Brazil',
                'stock' => 100,
                'is_active' => true,
            ],
            [
                'name' => 'Sumatra Mandheling',
                'description' => 'Earthy and wild, with notes of cedar, dark spice, and a syrupy heavyweight body. Wet-hulled using traditional Giling Basah processing for its distinct character.',
                'price' => 14.75,
                'image_url' => '/products/7.png',
                'roast_type' => 'Dark',
                'origin' => 'Indonesia',
                'stock' => 100,
                'is_active' => true,
            ],
            [
                'name' => 'Decaf Colombia',
                'description' => 'Swiss Water processed to remove caffeine without stripping flavour. Smooth, gently sweet, and surprisingly full-bodied — proof that decaf does not have to be dull.',
                'price' => 13.25,
                'image_url' => '/products/8.png',
                'roast_type' => 'Medium (Decaf)',
                'origin' => 'Colombia',
                'stock' => 100,
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
