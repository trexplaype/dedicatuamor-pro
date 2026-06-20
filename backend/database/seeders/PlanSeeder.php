<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        Plan::updateOrCreate(
            ['slug' => 'free'],
            [
                'name' => 'FREE',
                'price_type' => 'free',
                'price_amount' => 0,
                'duration_days' => 1,
                'access_level' => 'free',
                'is_active' => true,
            ]
        );

        Plan::updateOrCreate(
            ['slug' => 'premium'],
            [
                'name' => 'PREMIUM',
                'price_type' => 'coins',
                'price_amount' => 150,
                'duration_days' => 30,
                'access_level' => 'premium',
                'is_active' => true,
            ]
        );

        Plan::updateOrCreate(
            ['slug' => 'vip'],
            [
                'name' => 'VIP',
                'price_type' => 'coins',
                'price_amount' => 300,
                'duration_days' => 30,
                'access_level' => 'vip',
                'is_active' => true,
            ]
        );

        Plan::updateOrCreate(
            ['slug' => 'super-user'],
            [
                'name' => 'SUPER USER',
                'price_type' => 'money',
                'price_amount' => 50,
                'duration_days' => 365,
                'access_level' => 'exclusive',
                'monthly_limit' => 10,
                'is_active' => true,
            ]
        );
    }
}
