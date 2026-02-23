<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomBlend extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'origin',
        'roast_option_id',
        'grind_option_id',
        'size_option_id',
        'extras',
        'price_total',
        'description',
    ];

    protected $casts = [
        'extras' => 'array',
        'price_total' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function roastOption()
    {
        return $this->belongsTo(BlendOption::class, 'roast_option_id');
    }

    public function grindOption()
    {
        return $this->belongsTo(BlendOption::class, 'grind_option_id');
    }

    public function sizeOption()
    {
        return $this->belongsTo(BlendOption::class, 'size_option_id');
    }
}



