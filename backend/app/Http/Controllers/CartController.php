<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Services\CartPricingService;

class CartController extends Controller
{
    public function preview(Request $request, CartPricingService $pricing)
    {
        
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.type' => ['required', Rule::in(['product', 'custom_blend'])],

            // Product fields 
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
            $type = $item['type'] ?? null;

            if ($type === 'product') {
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

            if ($type === 'custom_blend') {
                if (!isset($item['custom_blend']) || !is_array($item['custom_blend'])) {
                    return response()->json([
                        'message' => "Item {$index}: custom_blend is required for type=custom_blend.",
                    ], 422);
                }

                foreach (['roast_option_id', 'grind_option_id', 'size_option_id'] as $key) {
                    if (!isset($item['custom_blend'][$key])) {
                        return response()->json([
                            'message' => "Item {$index}: custom_blend.{$key} is required.",
                        ], 422);
                    }
                }
            }
        }

        // Price + build line items via  service
        $result = $pricing->price($items);

        if (isset($result['error'])) {
            return response()->json([
                'message' => $result['error']['message'] ?? 'Cart pricing failed.',
            ], $result['error']['status'] ?? 422);
        }

        $lineItems = array_map(function ($li) {
            $unit = (int) ($li['unit_price_pence'] ?? 0);
            $line = (int) ($li['line_total_pence'] ?? 0);

       
            unset($li['unit_price_pence'], $li['line_total_pence']);

       
            $li['unit_price'] = number_format($unit / 100, 2, '.', '');
            $li['line_total'] = number_format($line / 100, 2, '.', '');

            return $li;
        }, $result['lineItems']);

        return response()->json([
            'items' => $lineItems,
            'subtotal' => number_format($result['subtotalPence'] / 100, 2, '.', ''),
            'shipping' => number_format($result['shippingPence'] / 100, 2, '.', ''),
            'total' => number_format($result['totalPence'] / 100, 2, '.', ''),
        ]);
    }
}