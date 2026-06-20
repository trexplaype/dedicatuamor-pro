<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RewardTask;
use Illuminate\Http\Request;

class AdminRewardTaskController extends Controller
{
    public function index()
    {
        return response()->json(
            RewardTask::orderBy('sort_order')
                ->orderBy('id')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:ads,whatsapp_invite',
            'target_count' => 'required|integer|min:1',
            'reward_coins' => 'required|integer|min:0',
            'duration_seconds' => 'nullable|integer|min:0',
            'is_daily' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $task = RewardTask::create([
            'title' => $data['title'],
            'type' => $data['type'],
            'target_count' => $data['target_count'],
            'reward_coins' => $data['reward_coins'],
            'duration_seconds' => $data['duration_seconds'] ?? 30,
            'is_daily' => $data['is_daily'] ?? true,
            'is_active' => $data['is_active'] ?? true,
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return response()->json([
            'message' => 'Recompensa creada correctamente.',
            'task' => $task,
        ], 201);
    }

    public function update(Request $request, RewardTask $rewardTask)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:ads,whatsapp_invite',
            'target_count' => 'required|integer|min:1',
            'reward_coins' => 'required|integer|min:0',
            'duration_seconds' => 'nullable|integer|min:0',
            'is_daily' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $rewardTask->update([
            'title' => $data['title'],
            'type' => $data['type'],
            'target_count' => $data['target_count'],
            'reward_coins' => $data['reward_coins'],
            'duration_seconds' => $data['duration_seconds'] ?? 30,
            'is_daily' => $data['is_daily'] ?? true,
            'is_active' => $data['is_active'] ?? true,
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return response()->json([
            'message' => 'Recompensa actualizada correctamente.',
            'task' => $rewardTask->fresh(),
        ]);
    }

    public function destroy(RewardTask $rewardTask)
    {
        $rewardTask->delete();

        return response()->json([
            'message' => 'Recompensa eliminada correctamente.',
        ]);
    }
}
