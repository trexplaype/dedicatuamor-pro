<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RewardAdSession extends Model
{
    protected $fillable = [
        'user_id',
        'action_type',
        'coins',
        'duration_seconds',
        'started_at',
        'completed_at',
        'claimed_at',
        'status',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'claimed_at' => 'datetime',
    ];
}
