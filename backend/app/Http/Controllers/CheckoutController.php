<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Stripe\Stripe;
use Stripe\Checkout\Session as CheckoutSession;
use App\Services\CartPricingService;

class CheckoutController extends Controller
{
    public function createSession(Request $request, CartPricingService $pricing)
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.type' => ['required', Rule::in(['product', 'custom_blend'])],

            'items.*.product_id' => ['nullable', 'integer'],
            'items.*.quantity' => ['nullable', 'integer', 'min:1', 'max:99'],

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
                    return response()->json(['message' => "Item {$index}: product_id is required for type=product."], 422);
                }
                if (!isset($item['quantity'])) {
                    return response()->json(['message' => "Item {$index}: quantity is required for type=product."], 422);
                }
            }

            if (($item['type'] ?? null) === 'custom_blend') {
                if (!isset($item['custom_blend']) || !is_array($item['custom_blend'])) {
                    return response()->json(['message' => "Item {$index}: custom_blend is required for type=custom_blend."], 422);
                }

                foreach (['roast_option_id', 'grind_option_id', 'size_option_id'] as $key) {
                    if (!isset($item['custom_blend'][$key])) {
                        return response()->json(['message' => "Item {$index}: custom_blend.{$key} is required."], 422);
                    }
                }
            }
        }

        // Call the pricing service to get line items and totals
        $result = $pricing->price($items);

        if (isset($result['error'])) {
            return response()->json(['message' => $result['error']['message']], $result['error']['status']);
        }

        // Build Stripe line_items
        $stripeLineItems = [];

        foreach ($result['lineItems'] as $li) {
            if ($li['type'] === 'product') {
                $stripeLineItems[] = [
                    'quantity' => (int) $li['quantity'],
                    'price_data' => [
                        'currency' => 'gbp',
                        'unit_amount' => (int) $li['unit_price_pence'],
                        'product_data' => [
                            'name' => $li['name'],
                            'metadata' => [
                                'type' => 'product',
                                'product_id' => (string) $li['product_id'],
                            ],
                        ],
                    ],
                ];
                continue;
            }

            if ($li['type'] === 'custom_blend') {
                $stripeLineItems[] = [
                    'quantity' => 1,
                    'price_data' => [
                        'currency' => 'gbp',
                        'unit_amount' => (int) $li['unit_price_pence'],
                        'product_data' => [
                            'name' => 'Custom Blend',
                            'metadata' => [
                                'type' => 'custom_blend',
                                'cart_item_id' => (string) ($li['cart_item_id'] ?? ''),
                                'roast' => (string) ($li['roast_name'] ?? ''),
                                'grind' => (string) ($li['grind_name'] ?? ''),
                                'size'  => (string) ($li['size_name'] ?? ''),
                                'extras' => json_encode($li['extras_names'] ?? []),
                            ],
                        ],
                    ],
                ];
            }
        }

        Stripe::setApiKey(config('services.stripe.secret'));

        $frontend = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

        $session = CheckoutSession::create([
            'mode' => 'payment',
            'line_items' => $stripeLineItems,
            'success_url' => $frontend . '/checkout/success',
            'cancel_url'  => $frontend . '/cart-preview',
            'metadata' => [
                'user_id' => (string) $request->user()->id,
            ],
        ]);

        return response()->json(['url' => $session->url]);
    }
}