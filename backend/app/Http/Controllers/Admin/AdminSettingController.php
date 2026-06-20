<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class AdminSettingController extends Controller
{
    public function show()
    {
        $settings = Setting::first();

        if (! $settings) {
            $settings = Setting::create([
                'reward_ad_30' => 10,
                'reward_ad_60' => 25,
                'reward_whatsapp' => 15,
                'reward_invite_friend' => 50,
                'default_template_price' => 50,
                'app_name' => 'DEV AGS',
                'admin_whatsapp' => null,
                'contact_email' => null,
                'telegram_url' => null,
                'support_url' => null,
                'terms_url' => null,
                'coins_per_sol' => 20,
                'ads_enabled' => true,
            ]);
        }

        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $settings = Setting::firstOrCreate([]);

        $data = $request->validate([
            'reward_ad_30' => 'required|integer|min:0',
            'reward_ad_60' => 'required|integer|min:0',
            'reward_whatsapp' => 'required|integer|min:0',
            'reward_invite_friend' => 'required|integer|min:0',
            'default_template_price' => 'required|integer|min:0',
            'app_name' => 'required|string|max:255',
            'admin_whatsapp' => 'nullable|string|max:30',
            'contact_email' => 'nullable|email|max:255',
            'telegram_url' => 'nullable|string|max:255',
            'support_url' => 'nullable|string|max:255',
            'terms_url' => 'nullable|string|max:255',
            'coins_per_sol' => 'required|integer|min:1',
            'ads_enabled' => 'required|boolean',
        ]);

        $settings->update($data);

        return response()->json([
            'message' => 'Configuración actualizada correctamente.',
            'settings' => $settings->fresh(),
        ]);
    }
}
