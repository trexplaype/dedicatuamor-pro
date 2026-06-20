<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'plan_id',

        'plan_slug',
        'plan_name',
        'plan_price',

        'status',

        'starts_at',
        'expires_at',

        'paid_with',
        'amount_paid',

        'duration_value',
        'duration_unit',

        'subscription_duration_value',
        'subscription_duration_unit',

        'page_duration_value',
        'page_duration_unit',

        'max_pages_per_day',
        'pages_per_day',

        'max_pages',

        'admin_retention_days',

        'access_level',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',

        'duration_value' => 'integer',
        'subscription_duration_value' => 'integer',
        'page_duration_value' => 'integer',

        'max_pages_per_day' => 'integer',
        'pages_per_day' => 'integer',

        'max_pages' => 'integer',

        'admin_retention_days' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }
}
