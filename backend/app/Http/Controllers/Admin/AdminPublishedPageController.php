<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserPage;
use Illuminate\Http\Request;

class AdminPublishedPageController extends Controller
{
    public function index()
    {
        return UserPage::with(['user', 'template', 'qrStyle'])
            ->where('status', 'published')
            ->latest()
            ->get();
    }

    public function show(UserPage $userPage)
    {
        return $userPage->load(['user', 'template', 'qrStyle']);
    }

    public function update(Request $request, UserPage $userPage)
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:50',
            'expires_at' => 'nullable|date',
        ]);

        $userPage->update($data);

        return $userPage->fresh(['user', 'template', 'qrStyle']);
    }

    public function destroy(UserPage $userPage)
    {
        $userPage->delete();

        return response()->json([
            'success' => true,
        ]);
    }
}
