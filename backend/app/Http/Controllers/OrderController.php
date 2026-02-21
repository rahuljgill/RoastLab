<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {

        $user = $request->user();

        // Get this user's orders with their items + product info
        $orders = Order::where('user_id', $user->id)
            ->with('items.product')
            ->latest() 
            ->get();

        return response()->json([
            'orders' => $orders,
        ]);
    }
}