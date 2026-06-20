<?php

namespace App\Models;

use App\Traits\HasUniqueSlug;
use Illuminate\Database\Eloquent\Model;

class UserPage extends Model
{
    use HasUniqueSlug;

    protected $fillable = [
        'user_id',
        'template_id',
        'user_template_id',
        'plan_id',
        'template_title',

        'title',
        'slug',

        'content',
        'data_json',

        'is_published',
        'status',

        'public_url',
        'qr_image',
        'qr_style_id',

        'published_at',
        'expires_at',
        'admin_retention_days',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'data_json' => 'array',
        'published_at' => 'datetime',
        'expires_at' => 'datetime',
        'qr_style_id' => 'integer',
        'admin_retention_days' => 'integer',
    ];

    protected function slugSource(): string
    {
        return 'title';
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function template()
    {
        return $this->belongsTo(Template::class);
    }

    public function userTemplate()
    {
        return $this->belongsTo(UserTemplate::class, 'user_template_id');
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function qrStyle()
    {
        return $this->belongsTo(QrStyle::class, 'qr_style_id');
    }

    public function assets()
    {
        return $this->hasMany(UserPageAsset::class);
    }

    public function getIsExpiredAttribute()
    {
        return $this->expires_at && now()->greaterThan($this->expires_at);
    }

    public function getIsActiveAttribute()
    {
        return $this->status === 'published'
            && (! $this->expires_at || now()->lessThanOrEqualTo($this->expires_at));
    }
}
