<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserPageAsset extends Model
{
    protected $fillable = [
        'user_id',
        'user_page_id',

        'type',
        'source_type',

        'title',
        'url',

        'file_path',
        'file_name',
        'mime_type',
        'file_size',

        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'file_size' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function page()
    {
        return $this->belongsTo(UserPage::class, 'user_page_id');
    }

    public function userPage()
    {
        return $this->belongsTo(UserPage::class, 'user_page_id');
    }

    public function template()
    {
        return $this->hasOneThrough(
            Template::class,
            UserPage::class,
            'id',
            'id',
            'user_page_id',
            'template_id'
        );
    }
}
