<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RewardLog extends Model
{
    protected $fillable = [
        'user_id',
        'action_type',
        'coins',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
