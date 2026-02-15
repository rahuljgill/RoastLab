<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomBlend extends Model
{
    protected $fillable = [
        'user_id',
        'origin',
        'roast_level',
        'grind_type',
        'size',
        'price',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];



    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
