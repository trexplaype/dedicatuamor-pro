<?php

namespace App\Http\Controllers;

use App\Models\RewardLog;
use Illuminate\Http\Request;

class RewardController extends Controller
{
    public function claim(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'action_type' => 'required|string',
        ]);

        $rewards = [
            'ad_30' => 10,
            'ad_60' => 25,
            'whatsapp_share' => 15,
            'friend_invite' => 50,
        ];

        if (! isset($rewards[$request->action_type])) {
            return response()->json([
                'success' => false,
                'message' => 'Tipo de recompensa inválido',
            ], 400);
        }

        $coins = $rewards[$request->action_type];

        RewardLog::create([
            'user_id' => $user->id,
            'action_type' => $request->action_type,
            'coins' => $coins,
        ]);

        $user->increment('coins', $coins);

        return response()->json([
            'success' => true,
            'message' => "Ganaste {$coins} monedas",
            'coins_earned' => $coins,
            'total_coins' => $user->fresh()->coins,
        ]);
    }
}
