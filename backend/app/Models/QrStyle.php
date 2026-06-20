<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QrStyle extends Model
{
    protected $table = 'qr_styles';

    protected $fillable = [
        'name',
        'slug',
        'plan_level',
        'primary_color',
        'secondary_color',
        'shape',
        'logo_enabled',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'logo_enabled' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
