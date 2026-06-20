<?php

namespace App\Http\Controllers;

use App\Models\RewardAdSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RewardAdController extends Controller
{
    private function rewardConfig(string $actionType): ?array
    {
        return match ($actionType) {
            'ad_30' => [
                'coins' => 10,
                'duration_seconds' => 30,
            ],
            'ad_60' => [
                'coins' => 25,
                'duration_seconds' => 60,
            ],
            default => null,
        };
    }

    public function start(Request $request)
    {
        $request->validate([
            'action_type' => ['required', 'string'],
        ]);

        $config = $this->rewardConfig($request->action_type);

        if (! $config) {
            return response()->json([
                'message' => 'Tipo de anuncio inválido.',
            ], 422);
        }

        $session = RewardAdSession::create([
            'user_id' => $request->user()->id,
            'action_type' => $request->action_type,
            'coins' => $config['coins'],
            'duration_seconds' => $config['duration_seconds'],
            'started_at' => now(),
            'status' => 'started',
        ]);

        return response()->json([
            'message' => 'Anuncio iniciado.',
            'session_id' => $session->id,
            'duration_seconds' => $session->duration_seconds,
            'coins' => $session->coins,
        ]);
    }

    public function claim(Request $request)
    {
        $request->validate([
            'session_id' => ['required', 'integer'],
        ]);

        return DB::transaction(function () use ($request) {
            $session = RewardAdSession::where('id', $request->session_id)
                ->where('user_id', $request->user()->id)
                ->lockForUpdate()
                ->first();

            if (! $session) {
                return response()->json([
                    'message' => 'Sesión de anuncio no encontrada.',
                ], 404);
            }

            if ($session->status === 'claimed') {
                return response()->json([
                    'message' => 'Esta recompensa ya fue reclamada.',
                ], 400);
            }

            if ($session->status === 'cancelled') {
                return response()->json([
                    'message' => 'El anuncio fue cancelado.',
                ], 400);
            }

            $secondsPassed = $session->started_at->diffInSeconds(now());

            if ($secondsPassed < $session->duration_seconds) {
                return response()->json([
                    'message' => 'Debes ver el anuncio completo para reclamar.',
                    'seconds_remaining' => $session->duration_seconds - $secondsPassed,
                ], 400);
            }

            $user = $request->user();
            $user->coins += $session->coins;
            $user->save();

            $session->update([
                'status' => 'claimed',
                'completed_at' => now(),
                'claimed_at' => now(),
            ]);

            return response()->json([
                'message' => "Ganaste {$session->coins} monedas.",
                'coins_earned' => $session->coins,
                'total_coins' => $user->coins,
            ]);
        });
    }

    public function cancel(Request $request)
    {
        $request->validate([
            'session_id' => ['required', 'integer'],
        ]);

        $session = RewardAdSession::where('id', $request->session_id)
            ->where('user_id', $request->user()->id)
            ->where('status', 'started')
            ->first();

        if ($session) {
            $session->update([
                'status' => 'cancelled',
            ]);
        }

        return response()->json([
            'message' => 'Anuncio cancelado.',
        ]);
    }
}
