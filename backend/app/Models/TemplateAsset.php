<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TemplateAsset extends Model
{
    protected $fillable = [
        'template_id',
        'type',
        'source_type',
        'name',
        'url',
        'file_path',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function template()
    {
        return $this->belongsTo(Template::class);
    }
}
