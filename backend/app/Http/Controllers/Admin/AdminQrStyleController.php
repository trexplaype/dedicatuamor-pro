<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QrStyle;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminQrStyleController extends Controller
{
    public function index()
    {
        return QrStyle::orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public function show(QrStyle $qrStyle)
    {
        return $qrStyle;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:qr_styles,slug',
            'plan_level' => 'required|string|max:50',
            'primary_color' => 'nullable|string|max:20',
            'secondary_color' => 'nullable|string|max:20',
            'shape' => 'nullable|string|max:50',
            'logo_enabled' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
            'preview_image' => 'nullable|string|max:500',
        ]);

        $data['slug'] = Str::slug($data['slug']);

        return QrStyle::create($data);
    }

    public function update(Request $request, QrStyle $qrStyle)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:qr_styles,slug,'.$qrStyle->id,
            'plan_level' => 'required|string|max:50',
            'primary_color' => 'nullable|string|max:20',
            'secondary_color' => 'nullable|string|max:20',
            'shape' => 'nullable|string|max:50',
            'logo_enabled' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
            'preview_image' => 'nullable|string|max:500',
        ]);

        $data['slug'] = Str::slug($data['slug']);

        $qrStyle->update($data);

        return $qrStyle->fresh();
    }

    public function destroy(QrStyle $qrStyle)
    {
        $qrStyle->delete();

        return response()->json([
            'success' => true,
        ]);
    }
}
