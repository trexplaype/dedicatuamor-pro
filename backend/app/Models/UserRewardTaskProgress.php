<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserRewardTaskProgress extends Model
{
    protected $table = 'user_reward_task_progress';

    protected $fillable = [
        'user_id',
        'reward_task_id',
        'progress_count',
        'reward_date',
        'claimed_at',
    ];

    protected $casts = [
        'reward_date' => 'date',
        'claimed_at' => 'datetime',
    ];
}
