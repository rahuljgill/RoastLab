<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent(
                $request->getContent(),
                $request->header('Stripe-Signature'),
                $endpointSecret
            );
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Invalid webhook signature'], 400);
        }

        if ($event->type !== 'checkout.session.completed') {
            return response()->json(['received' => true]);
        }

        $session = $event->data->object;

        if (($session->payment_status ?? null) !== 'paid') {
            return response()->json(['received' => true]);
        }

        $stripeSessionId = $session->id;
        $userId = (int) ($session->metadata->user_id ?? 0);

        if ($userId <= 0) {
            return response()->json(['message' => 'Missing user_id metadata'], 422);
        }

        if (Order::where('stripe_session_id', $stripeSessionId)->exists()) {
            return response()->json(['received' => true]);
        }

        Stripe::setApiKey(config('services.stripe.secret'));

        $lineItems = \Stripe\Checkout\Session::allLineItems($stripeSessionId, [
            'limit' => 100,
            'expand' => ['data.price.product'],
        ]);

        $order = Order::create([
            'user_id' => $userId,
            'status' => 'paid',
            'payment_method' => 'stripe_checkout',
            'total_amount' => number_format(($session->amount_total ?? 0) / 100, 2, '.', ''),
            'stripe_session_id' => $stripeSessionId,
        ]);

        foreach ($lineItems->data as $item) {
            $qty = (int) ($item->quantity ?? 1);
            $unitAmount = (int) ($item->price->unit_amount ?? 0);

            $stripeProduct = $item->price->product;

      
            $meta = $stripeProduct->metadata ?? null;

            $type = (string) ($meta->type ?? 'product');

   
            if ($type === 'product') {
                $productId = (int) ($meta->product_id ?? 0);

                if ($productId <= 0) {
                    continue;
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'type' => 'product',
                    'product_id' => $productId,
                    'custom_blend' => null,
                    'quantity' => $qty,
                    'price' => number_format($unitAmount / 100, 2, '.', ''),
                ]);

                continue;
            }

      
            if ($type === 'custom_blend') {
                $extras = [];
                if (!empty($meta->extras)) {
                    $decoded = json_decode((string) $meta->extras, true);
                    $extras = is_array($decoded) ? $decoded : [];
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'type' => 'custom_blend',
                    'product_id' => null,
                    'quantity' => 1,
                    'price' => number_format($unitAmount / 100, 2, '.', ''),
                    'custom_blend' => [
                        'cart_item_id' => $meta->cart_item_id ?? null,
                        'roast' => $meta->roast ?? null,
                        'grind' => $meta->grind ?? null,
                        'size'  => $meta->size ?? null,
                        'extras' => $extras,
                    ],
                ]);

                continue;
            }
        }

        return response()->json(['received' => true]);
    }
}