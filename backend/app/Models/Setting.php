<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'reward_ad_30',
        'reward_ad_60',
        'reward_whatsapp',
        'reward_invite_friend',
        'default_template_price',
        'app_name',
        'admin_whatsapp',
        'contact_email',
        'telegram_url',
        'support_url',
        'terms_url',
        'coins_per_sol',
        'ads_enabled',
    ];

    protected $casts = [
        'reward_ad_30' => 'integer',
        'reward_ad_60' => 'integer',
        'reward_whatsapp' => 'integer',
        'reward_invite_friend' => 'integer',
        'default_template_price' => 'integer',
        'coins_per_sol' => 'integer',
        'ads_enabled' => 'boolean',
    ];
}
