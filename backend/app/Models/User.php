<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable([
    'name',
    'email',
    'password',
    'coins',
    'free_used',
    'first_purchase_completed',
    'role',
    'public_id',
    'active_plan',
])]

#[Hidden([
    'password',
    'remember_token',
])]

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected static function booted(): void
    {
        static::creating(function ($user) {
            if (! $user->public_id) {
                do {
                    $publicId = str_pad(
                        (string) random_int(0, 99999999),
                        8,
                        '0',
                        STR_PAD_LEFT
                    );
                } while (self::where('public_id', $publicId)->exists());

                $user->public_id = $publicId;
            }
        });
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'free_used' => 'boolean',
            'first_purchase_completed' => 'boolean',
        ];
    }

    public function templates()
    {
        return $this->belongsToMany(Template::class, 'user_templates')
            ->using(UserTemplate::class)
            ->withPivot([
                'id',

                'purchased_at',
                'expires_at',

                'price_paid',

                'access_duration_value',
                'access_duration_unit',

                'page_duration_value',
                'page_duration_unit',

                'admin_retention_days',
            ])
            ->withTimestamps();
    }

    public function userTemplates()
    {
        return $this->hasMany(UserTemplate::class);
    }

    public function pages()
    {
        return $this->hasMany(UserPage::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->latestOfMany();
    }
}
