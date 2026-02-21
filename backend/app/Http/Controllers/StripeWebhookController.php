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

        //  Verify this request actually came from Stripe
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

        // Make sure payment is actually paid
        if (($session->payment_status ?? null) !== 'paid') {
            return response()->json(['received' => true]);
        }

        $stripeSessionId = $session->id;
        $userId = (int) ($session->metadata->user_id ?? 0);

        if ($userId <= 0) {
            return response()->json(['message' => 'Missing user_id metadata'], 422);
        }

        //  Prevent duplicate orders (
        if (Order::where('stripe_session_id', $stripeSessionId)->exists()) {
            return response()->json(['received' => true]);
        }

        //  Fetch line items from Stripe
        Stripe::setApiKey(config('services.stripe.secret'));

        $lineItems = \Stripe\Checkout\Session::allLineItems(
            $stripeSessionId,
            [
                'limit' => 100,
                'expand' => ['data.price.product'],
            ]
        );


        $order = Order::create([
            'user_id' => $userId,
            'status' => 'paid',
            'payment_method' => 'stripe_checkout',
            'total_amount' => number_format(($session->amount_total ?? 0) / 100, 2, '.', ''),
            'stripe_session_id' => $stripeSessionId,
        ]);

 
        foreach ($lineItems->data as $item) {

            $qty = (int) $item->quantity;
            $unitAmount = (int) $item->price->unit_amount;

            $stripeProduct = $item->price->product;
            $productId = (int) ($stripeProduct->metadata->product_id ?? 0);

            if ($productId <= 0) {
                continue;
            }

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $productId,
                'quantity' => $qty,
                'price' => number_format($unitAmount / 100, 2, '.', ''),
            ]);
        }

        return response()->json(['received' => true]);
    }
}