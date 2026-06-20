<?php

namespace App\Models;

use App\Traits\HasUniqueSlug;
use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    use HasUniqueSlug;

    protected $fillable = [
        'name',
        'title',
        'slug',

        'category',
        'category_id',
        'required_plan',
        'access_plans',

        'allow_free_initial_use',
        'free_initial_page_limit',
        'allow_individual_purchase',
        'individual_price_coins',

        'description',
        'image',
        'preview_image',
        'preview_url',
        'editor_url',
        'view_url',
        'source_zip_path',

        'price_coins',
        'discount_coins',
        'max_pages_by_plan',
        'max_pages_by_purchase',

        'access_duration_value',
        'access_duration_unit',
        'page_duration_value',
        'page_duration_unit',
        'admin_retention_days',

        'is_free',
        'is_active',

        'html_content',
        'css_content',
        'js_content',
        'fields_json',

        'status',

        'allow_upload_assets',
        'allow_external_assets',
        'use_default_assets',

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
    ];

    protected $casts = [
        'is_free' => 'boolean',
        'is_active' => 'boolean',
        'fields_json' => 'array',
        'access_plans' => 'array',

        'allow_free_initial_use' => 'boolean',
        'allow_individual_purchase' => 'boolean',

        'allow_upload_assets' => 'boolean',
        'allow_external_assets' => 'boolean',
        'use_default_assets' => 'boolean',

        'category_id' => 'integer',
        'price_coins' => 'integer',
        'discount_coins' => 'integer',
        'max_pages_by_plan' => 'integer',
        'max_pages_by_purchase' => 'integer',

        'free_initial_page_limit' => 'integer',
        'individual_price_coins' => 'integer',

        'access_duration_value' => 'integer',
        'page_duration_value' => 'integer',
        'admin_retention_days' => 'integer',

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

    protected function slugSource(): string
    {
        return 'name';
    }

    public function categoryRelation()
    {
        return $this->belongsTo(TemplateCategory::class, 'category_id');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_templates')
            ->withPivot([
                'purchased_at',
                'expires_at',
                'price_paid',
                'is_individual_purchase',
                'access_duration_value',
                'access_duration_unit',
                'page_duration_value',
                'page_duration_unit',
                'admin_retention_days',
            ])
            ->withTimestamps();
    }

    public function pages()
    {
        return $this->hasMany(UserPage::class);
    }

    public function assets()
    {
        return $this->hasMany(TemplateAsset::class);
    }
}
