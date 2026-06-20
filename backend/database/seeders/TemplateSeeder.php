<?php

namespace Database\Seeders;

use App\Models\Template;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    public function run(): void
    {
        Template::create([
            'name' => 'Romántica Pink',
            'slug' => 'romantica-pink',
            'category' => 'romance',
            'image' => 'templates/pink.jpg',
            'price_coins' => 50,
            'is_free' => true,
        ]);

        Template::create([
            'name' => 'Love Premium',
            'slug' => 'love-premium',
            'category' => 'premium',
            'image' => 'templates/love-premium.jpg',
            'price_coins' => 50,
        ]);

        Template::create([
            'name' => 'VIP Golden',
            'slug' => 'vip-golden',
            'category' => 'vip',
            'image' => 'templates/vip.jpg',
            'price_coins' => 50,
        ]);
    }
}
