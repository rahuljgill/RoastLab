<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlendOption extends Model
{
    protected $fillable = [
        'type',
        'name',
        'code',
        'price_delta',
        'meta',
        'is_active',
    ];

    protected $casts = [
        'price_delta' => 'decimal:2',
        'meta' => 'array',
        'is_active' => 'boolean',
    ];


    public function roastBlends()
    {
        return $this->hasMany(CustomBlend::class, 'roast_option_id');
    }

    public function grindBlends()
    {
        return $this->hasMany(CustomBlend::class, 'grind_option_id');
    }

    public function sizeBlends()
    {
        return $this->hasMany(CustomBlend::class, 'size_option_id');
    }
}