<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RewardTask extends Model
{
    protected $fillable = [
        'title',
        'type',
        'target_count',
        'reward_coins',
        'duration_seconds',
        'is_daily',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_daily' => 'boolean',
        'is_active' => 'boolean',
    ];
}
