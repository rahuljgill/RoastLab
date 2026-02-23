<?php

namespace App\Services;

use App\Models\Product;
use App\Models\BlendOption;
use Illuminate\Validation\Rule;
use Illuminate\Support\Collection;

class CartPricingService
{
    // METHOD COULD BE ABSTRACTED FURTHER BUT SINCE THE APP WON'T GROW MORE, THIS IS GOOD FOR NOW
  
    public function price(array $items): array
    {
        // Get all product IDs 
        $productIds = collect($items)
            ->filter(fn ($i) => ($i['type'] ?? null) === 'product')
            ->pluck('product_id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $productMap = collect();
        if ($productIds->count() > 0) {
            $products = Product::query()
                ->whereIn('id', $productIds)
                ->where('is_active', true)
                ->get(['id', 'name', 'price', 'image_url', 'origin', 'roast_type']);
             
            // Easy to look up products later    
            $productMap = $products->keyBy('id');
        }

        $optionIds = collect($items)
            ->filter(fn ($i) => ($i['type'] ?? null) === 'custom_blend')
            ->map(function ($i) {
                $blend_options = $i['custom_blend'] ?? [];
                $extras = $blend_options['extras'] ?? [];

                return [
                    $blend_options['roast_option_id'] ?? null,
                    $blend_options['grind_option_id'] ?? null,
                    $blend_options['size_option_id'] ?? null,
                    ...$extras,
                ];
            })
            ->flatten() // Combines the extras with the custom blend options into a single array
            ->filter()    // Remove any null and non-integer values 
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $optionMap = collect();
        if ($optionIds->count() > 0) {
            $options = BlendOption::query()
                ->whereIn('id', $optionIds)
                ->where('is_active', true)
                ->get(['id', 'type', 'name', 'price_delta']);

            $optionMap = $options->keyBy('id');
        }

        // build line items + totals 
        $lineItems = [];
        $subtotalPence = 0;

        foreach ($items as $index => $item) {
            $type = $item['type'] ?? null;

            if ($type === 'product') {
                $productId = (int) $item['product_id'];
                $qty = (int) ($item['quantity'] ?? 1);

                $product = $productMap->get($productId);
                if (!$product) {
                    return [
                        'error' => [
                            'message' => "Product {$productId} not found or unavailable.",
                            'status' => 422,
                        ],
                    ];
                }

                $unitPricePence = (int) round(((float) $product->price) * 100);
                $lineTotalPence = $unitPricePence * $qty;
                $subtotalPence += $lineTotalPence;

                $lineItems[] = [
                    'type' => 'product',
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'origin' => $product->origin,
                    'roast_type' => $product->roast_type,
                    'image_url' => $product->image_url,
                    'quantity' => $qty,
                    'unit_price_pence' => $unitPricePence,
                    'line_total_pence' => $lineTotalPence,
                ];

                continue;
            }

            if ($type === 'custom_blend') {
                $cb = $item['custom_blend'] ?? [];

                $roastId = (int) ($cb['roast_option_id'] ?? 0);
                $grindId = (int) ($cb['grind_option_id'] ?? 0);
                $sizeId  = (int) ($cb['size_option_id'] ?? 0);
                $extras  = is_array($cb['extras'] ?? null) ? $cb['extras'] : [];

                $roast = $optionMap->get($roastId);
                $grind = $optionMap->get($grindId);
                $size  = $optionMap->get($sizeId);

                if (!$roast || !$grind || !$size) {
                    return [
                        'error' => [
                            'message' => "Custom blend item {$index}: one or more selected options are invalid/unavailable.",
                            'status' => 422,
                        ],
                    ];
                }

                if ($roast->type !== 'roast' || $grind->type !== 'grind' || $size->type !== 'size') {
                    return [
                        'error' => [
                            'message' => "Custom blend item {$index}: option types do not match (roast/grind/size).",
                            'status' => 422,
                        ],
                    ];
                }

                $extrasModels = [];
                foreach ($extras as $extraIdRaw) {
                    $extraId = (int) $extraIdRaw;
                    $extra = $optionMap->get($extraId);

                    if (!$extra) {
                        return [
                            'error' => [
                                'message' => "Custom blend item {$index}: extra option {$extraId} is invalid/unavailable.",
                                'status' => 422,
                            ],
                        ];
                    }

                    if ($extra->type !== 'extra') {
                        return [
                            'error' => [
                                'message' => "Custom blend item {$index}: option {$extraId} is not an extra.",
                                'status' => 422,
                            ],
                        ];
                    }

                    $extrasModels[] = $extra;
                }

                $unitPricePence =
                    (int) round(((float) $size->price_delta) * 100)
                    + (int) round(((float) $roast->price_delta) * 100)
                    + (int) round(((float) $grind->price_delta) * 100)
                    + collect($extrasModels)->sum(fn ($x) => (int) round(((float) $x->price_delta) * 100));

                $qty = 1;
                $lineTotalPence = $unitPricePence * $qty;
                $subtotalPence += $lineTotalPence;

                $lineItems[] = [
                    'type' => 'custom_blend',
                    'cart_item_id' => $item['cart_item_id'] ?? null,
                    'title' => 'Custom Blend',
                    'roast_name' => $roast->name,
                    'grind_name' => $grind->name,
                    'size_name'  => $size->name,
                    'extras_names' => collect($extrasModels)->pluck('name')->values()->all(),
                    'quantity' => 1,
                    'unit_price_pence' => $unitPricePence,
                    'line_total_pence' => $lineTotalPence,
                ];

                continue;
            }
        }

        $shippingPence = ($subtotalPence >= 3000) ? 0 : 299;
        $totalPence = $subtotalPence + $shippingPence;

        return [
            'lineItems' => $lineItems,
            'subtotalPence' => $subtotalPence,
            'shippingPence' => $shippingPence,
            'totalPence' => $totalPence,
        ];
    }
}