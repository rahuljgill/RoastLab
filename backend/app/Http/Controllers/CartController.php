<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class CartController extends Controller
{
    public function preview(Request $request)
    {

        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $items = $validated['items'];


        $productIds = collect($items)->pluck('product_id')->unique()->values();

        $products = Product::query()
            ->whereIn('id', $productIds)
            ->where('is_active', true)
            ->get(['id', 'name', 'price', 'image_url', 'origin', 'roast_type']);

        // look up by ID
        $productMap = $products->keyBy('id');

        
        $lineItems = [];
        $subtotalPence = 0;

        // Match product_ID from cart to the product_ID from db and calculate totals
        foreach ($items as $item) {
            $productId = (int) $item['product_id'];
            $qty = (int) $item['quantity'];

            $product = $productMap->get($productId);

            if (!$product) {
             
                return response()->json([
                    'message' => "Product {$productId} not found or unavailable.",
                ], 422);
            }

            // Convert price to pennies as Stripe works in pennies
            $unitPricePence = (int) round(((float) $product->price) * 100);
            $lineTotalPence = $unitPricePence * $qty;

            $subtotalPence += $lineTotalPence;

            $lineItems[] = [
                'id' => $product->id,
                'name' => $product->name,
                'origin' => $product->origin,
                'roast_type' => $product->roast_type,
                'image_url' => $product->image_url,

                'quantity' => $qty,

                // Prices returned as decimals for UI
                'unit_price' => number_format($unitPricePence / 100, 2, '.', ''),
                'line_total' => number_format($lineTotalPence / 100, 2, '.', ''),
            ];
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
