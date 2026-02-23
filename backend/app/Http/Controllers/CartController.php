<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Models\Product;
use App\Models\BlendOption;

class CartController extends Controller
{
    public function preview(Request $request)
    {

        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.type' => ['required', Rule::in(['product', 'custom_blend'])],

            // Product item fields 
            'items.*.product_id' => ['nullable', 'integer'],
            'items.*.quantity' => ['nullable', 'integer', 'min:1', 'max:99'],

            // Custom blend fields
            'items.*.cart_item_id' => ['nullable', 'string', 'max:100'],
            'items.*.custom_blend' => ['nullable', 'array'],
            'items.*.custom_blend.roast_option_id' => ['nullable', 'integer'],
            'items.*.custom_blend.grind_option_id' => ['nullable', 'integer'],
            'items.*.custom_blend.size_option_id' => ['nullable', 'integer'],
            'items.*.custom_blend.extras' => ['nullable', 'array'],
            'items.*.custom_blend.extras.*' => ['integer'],
        ]);

        $items = $validated['items'];


        foreach ($items as $index => $item) {
            if (($item['type'] ?? null) === 'product') {
                if (!isset($item['product_id'])) {
                    return response()->json([
                        'message' => "Item {$index}: product_id is required for type=product.",
                    ], 422);
                }
                if (!isset($item['quantity'])) {
                    return response()->json([
                        'message' => "Item {$index}: quantity is required for type=product.",
                    ], 422);
                }
            }

            if (($item['type'] ?? null) === 'custom_blend') {
                if (!isset($item['custom_blend']) || !is_array($item['custom_blend'])) {
                    return response()->json([
                        'message' => "Item {$index}: custom_blend is required for type=custom_blend.",
                    ], 422);
                }

                $required = ['roast_option_id', 'grind_option_id', 'size_option_id'];

foreach ($required as $key) {
    if (!isset($item['custom_blend'][$key])) {
        return response()->json([
            'message' => "Item {$index}: custom_blend.{$key} is required.",
        ], 422);
    }
}
            }
        }

        //Get all the product IDS from the cart items and turn them into unique integers
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

            $productMap = $products->keyBy('id');
        }

      //Get all the blend option IDs
$optionIds = collect($items)
    ->filter(fn ($i) => ($i['type'] ?? null) === 'custom_blend')

    ->map(function ($i) {
        $custom_options = $i['custom_blend'] ?? [];
        $extras = $custom_options['extras'] ?? [];

        return [
            $custom_options['roast_option_id'] ?? null,
            $custom_options['grind_option_id'] ?? null,
            $custom_options['size_option_id'] ?? null,
            ...$extras,
        ];
    })

    ->flatten()     // Combines the extras with the custom blend options into a single array 
    ->filter()      // Remove nulls and non-integer values (in case of malformed input) 
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

        //Create line items
        $lineItems = [];
        $subtotalPence = 0;

        foreach ($items as $index => $item) {
            $type = $item['type'];

            // PRODUCT
            if ($type === 'product') {
                $productId = (int) $item['product_id'];
                $qty = (int) $item['quantity'];

                $product = $productMap->get($productId);
                if (!$product) {
                    return response()->json([
                        'message' => "Product {$productId} not found or unavailable.",
                    ], 422);
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
                    'unit_price' => number_format($unitPricePence / 100, 2, '.', ''),
                    'line_total' => number_format($lineTotalPence / 100, 2, '.', ''),
                ];

                continue;
            }

            // CUSTOM BLEND
            if ($type === 'custom_blend') {
                $custom_options = $item['custom_blend'];

                $roastId = (int) $custom_options['roast_option_id'];
                $grindId = (int) $custom_options['grind_option_id'];
                $sizeId  = (int) $custom_options['size_option_id'];
                $extras  = is_array($custom_options['extras'] ?? null) ? $custom_options['extras'] : [];

                $roast = $optionMap->get($roastId);
                $grind = $optionMap->get($grindId);
                $size  = $optionMap->get($sizeId);

                if (!$roast || !$grind || !$size) {
                    return response()->json([
                        'message' => "Custom blend item {$index}: one or more selected options are invalid/unavailable.",
                    ], 422);
                }

                if ($roast->type !== 'roast' || $grind->type !== 'grind' || $size->type !== 'size') {
                    return response()->json([
                        'message' => "Custom blend item {$index}: option types do not match (roast/grind/size).",
                    ], 422);
                }

                $extrasModels = [];
                foreach ($extras as $extraIdRaw) {
                    $extraId = (int) $extraIdRaw;
                    $extra = $optionMap->get($extraId);

                    if (!$extra) {
                        return response()->json([
                            'message' => "Custom blend item {$index}: extra option {$extraId} is invalid/unavailable.",
                        ], 422);
                    }

                    if ($extra->type !== 'extra') {
                        return response()->json([
                            'message' => "Custom blend item {$index}: option {$extraId} is not an extra.",
                        ], 422);
                    }

                    $extrasModels[] = $extra;
                }

                $unitPricePence =
                    (int) round(((float) $size->price_delta) * 100)
                    + (int) round(((float) $roast->price_delta) * 100)
                    + (int) round(((float) $grind->price_delta) * 100)
                    + collect($extrasModels)->sum(function ($x) {
                        return (int) round(((float) $x->price_delta) * 100);
                    });

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
                    'extras_names' => collect($extrasModels)->pluck('name')->values(),
                    'quantity' => $qty,
                    'unit_price' => number_format($unitPricePence / 100, 2, '.', ''),
                    'line_total' => number_format($lineTotalPence / 100, 2, '.', ''),
                ];

                continue;
            }
        }

        $shippingPence = ($subtotalPence >= 3000) ? 0 : 299;
        $totalPence = $subtotalPence + $shippingPence;

        return response()->json([
            'items' => $lineItems,
            'subtotal' => number_format($subtotalPence / 100, 2, '.', ''),
            'shipping' => number_format($shippingPence / 100, 2, '.', ''),
            'total' => number_format($totalPence / 100, 2, '.', ''),
        ]);
    }
}