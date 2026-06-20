<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;

class AdminSubscriptionController extends Controller
{
    public function index()
    {
        return Subscription::with(['user', 'plan'])
            ->latest()
            ->get();
    }

    public function show(Subscription $subscription)
    {
        return $subscription->load(['user', 'plan']);
    }

    public function update(Request $request, Subscription $subscription)
    {
        $data = $request->validate([
            'status' => 'nullable|string|max:50',
            'expires_at' => 'nullable|date',
            'starts_at' => 'nullable|date',
            'paid_with' => 'nullable|string|max:100',
            'amount_paid' => 'nullable|numeric',
        ]);

        $subscription->update($data);

        return $subscription->fresh(['user', 'plan']);
    }

    public function destroy(Subscription $subscription)
    {
        $subscription->delete();

        return response()->json([
            'success' => true,
        ]);
    }
}
