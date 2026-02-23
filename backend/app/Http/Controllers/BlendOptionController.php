<?php

namespace App\Http\Controllers;

use App\Models\BlendOption;
use Illuminate\Http\Request;

class BlendOptionController extends Controller
{

    public function index(Request $request)
    {
        $options = BlendOption::query()
            ->where('is_active', true)
            // Sort the options in this specific order
            ->orderByRaw("
                CASE
                    WHEN type = 'size' THEN 1
                    WHEN type = 'roast' THEN 2
                    WHEN type = 'grind' THEN 3
                    WHEN type = 'extra' THEN 4
                    ELSE 99
                END
            ")
           
            ->orderBy('name')
            ->get([
                'id',
                'type',
                'name',
                'price_delta',
                'is_active',
       
            ]);

        return response()->json([
            'options' => $options,
        ]);
    }
}