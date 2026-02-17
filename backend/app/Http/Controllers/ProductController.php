<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    
    public function index(Request $request)
    {
        $products = Product::query()
            ->where('is_active', true)
            ->orderBy('id')
            ->get([
                'id',
                'name',
                'description',
                'price',
                'image_url',
                'roast_type',
                'origin',
                'stock',
                'is_active',
                'created_at',
                'updated_at',
            ]);

      
        return response()->json([
            'products' => $products,
        ]);
    }
}
