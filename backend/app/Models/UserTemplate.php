<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class UserTemplate extends Pivot
{
    protected $table = 'user_templates';

    protected $fillable = [
        'user_id',
        'template_id',

        'purchased_at',
        'expires_at',

        'price_paid',

        'access_duration_value',
        'access_duration_unit',

        'page_duration_value',
        'page_duration_unit',

        'admin_retention_days',
    ];

    protected $casts = [
        'purchased_at' => 'datetime',
        'expires_at' => 'datetime',

        'admin_retention_days' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function template()
    {
        return $this->belongsTo(Template::class);
    }

    public function pages()
    {
        return $this->hasMany(UserPage::class);
    }
}
