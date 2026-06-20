<?php

namespace App\Models;

use App\Traits\HasUniqueSlug;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasUniqueSlug;

    protected $fillable = [
        'name',
        'slug',
        'price_type',
        'price_amount',

        'duration_value',
        'duration_unit',

        'page_duration_value',
        'page_duration_unit',

        'max_pages_per_day',

        'max_pages',
        'active_pages_limit',
        'max_storage_mb',

        'custom_link',
        'custom_qr',
        'premium_templates',
        'vip_templates',
        'exclusive_templates',
        'stats_level',

        'access_level',
        'features',
        'is_active',
        'monthly_limit',
        'discount_percent',
        'discount_ends_at',
        'only_new_users',

        'allow_upload_assets',
        'allow_external_assets',

        'max_upload_images',
        'max_upload_music',
        'max_upload_videos',
        'max_upload_audios',
        'max_upload_files',

        'max_external_images',
        'max_external_music',
        'max_external_videos',
        'max_external_audios',
        'max_external_files',

        'use_default_assets',
    ];

    protected $casts = [
        'features' => 'array',

        'is_active' => 'boolean',
        'only_new_users' => 'boolean',

        'custom_link' => 'boolean',
        'custom_qr' => 'boolean',
        'premium_templates' => 'boolean',
        'vip_templates' => 'boolean',
        'exclusive_templates' => 'boolean',

        'allow_upload_assets' => 'boolean',
        'allow_external_assets' => 'boolean',
        'use_default_assets' => 'boolean',

        'discount_ends_at' => 'datetime',
        'price_amount' => 'decimal:2',

        'duration_value' => 'integer',
        'page_duration_value' => 'integer',
        'max_pages_per_day' => 'integer',

        'max_pages' => 'integer',
        'active_pages_limit' => 'integer',
        'max_storage_mb' => 'integer',
        'monthly_limit' => 'integer',
        'discount_percent' => 'integer',

        'max_upload_images' => 'integer',
        'max_upload_music' => 'integer',
        'max_upload_videos' => 'integer',
        'max_upload_audios' => 'integer',
        'max_upload_files' => 'integer',

        'max_external_images' => 'integer',
        'max_external_music' => 'integer',
        'max_external_videos' => 'integer',
        'max_external_audios' => 'integer',
        'max_external_files' => 'integer',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscriptions()
    {
        return $this->hasMany(Subscription::class)
            ->where('status', 'active');
    }
}
