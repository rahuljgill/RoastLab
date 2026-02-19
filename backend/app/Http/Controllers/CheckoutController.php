<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session as CheckoutSession;

class CheckoutController extends Controller
{
    public function createSession(Request $request)
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
            ->get(['id', 'name', 'price']);

        $productMap = $products->keyBy('id');

        $lineItems = [];

        foreach ($items as $item) {
            $productId = (int) $item['product_id'];
            $qty = (int) $item['quantity'];

            $product = $productMap->get($productId);

            if (!$product) {
                return response()->json([
                    'message' => "Product {$productId} not found.",
                ], 422);
            }

            $unitAmount = (int) round(((float) $product->price) * 100);

            $lineItems[] = [
                'quantity' => $qty,
                'price_data' => [
                    'currency' => 'gbp',
                    'unit_amount' => $unitAmount,
                    'product_data' => [
                        'name' => $product->name,
                    ],
                ],
            ];
        }

        Stripe::setApiKey(config('services.stripe.secret'));

        $frontend = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

        $session = CheckoutSession::create([
            'mode' => 'payment',
            'line_items' => $lineItems,
            'success_url' => $frontend . '/checkout/success',
            'cancel_url'  => $frontend . '/cart-preview',
        ]);

        return response()->json([
            'url' => $session->url,
        ]);
    }
}
