<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageReaction extends Model
{
    protected $fillable = [
        'user_page_id',
        'reaction',
    ];

    public function page()
    {
        return $this->belongsTo(UserPage::class, 'user_page_id');
    }
}
