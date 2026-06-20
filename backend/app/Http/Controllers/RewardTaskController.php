<?php

namespace App\Http\Controllers;

use App\Models\RewardTask;
use App\Models\UserRewardTaskProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RewardTaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $today = now()->toDateString();

        $tasks = RewardTask::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(function ($task) use ($user, $today) {
                $progress = UserRewardTaskProgress::where('user_id', $user->id)
                    ->where('reward_task_id', $task->id)
                    ->where('reward_date', $today)
                    ->first();

                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'type' => $task->type,
                    'target_count' => $task->target_count,
                    'reward_coins' => $task->reward_coins,
                    'duration_seconds' => $task->duration_seconds,
                    'is_daily' => $task->is_daily,
                    'progress_count' => $progress?->progress_count ?? 0,
                    'claimed_at' => $progress?->claimed_at,
                    'completed' => $progress && $progress->claimed_at !== null,
                ];
            });

        return response()->json($tasks);
    }

    public function addProgress(Request $request, RewardTask $rewardTask)
    {
        $user = $request->user();

        if (! $rewardTask->is_active) {
            return response()->json([
                'message' => 'Esta recompensa no está activa.',
            ], 400);
        }

        $today = now()->toDateString();

        return DB::transaction(function () use ($user, $rewardTask, $today) {
            $progress = UserRewardTaskProgress::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'reward_task_id' => $rewardTask->id,
                    'reward_date' => $today,
                ],
                [
                    'progress_count' => 0,
                    'claimed_at' => null,
                ]
            );

            if ($progress->claimed_at) {
                return response()->json([
                    'message' => 'Ya reclamaste esta recompensa hoy.',
                    'progress' => $progress,
                    'coins' => $user->coins,
                ], 400);
            }

            $progress->progress_count += 1;

            if ($progress->progress_count >= $rewardTask->target_count) {
                $progress->progress_count = $rewardTask->target_count;
                $progress->claimed_at = now();

                $user->coins += $rewardTask->reward_coins;
                $user->save();
            }

            $progress->save();

            return response()->json([
                'message' => $progress->claimed_at
                    ? 'Recompensa completada. Monedas agregadas.'
                    : 'Progreso actualizado.',
                'progress_count' => $progress->progress_count,
                'target_count' => $rewardTask->target_count,
                'reward_coins' => $rewardTask->reward_coins,
                'completed' => $progress->claimed_at !== null,
                'coins' => $user->coins,
            ]);
        });
    }
}
