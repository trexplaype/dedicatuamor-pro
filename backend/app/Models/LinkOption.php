<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LinkOption extends Model
{
    protected $table = 'link_options';

    protected $fillable = [
        'slug',
        'label',
        'plan_level',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
