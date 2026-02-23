<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'type',
        'product_id',
        'custom_blend',
        'quantity',
        'price',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'custom_blend' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}