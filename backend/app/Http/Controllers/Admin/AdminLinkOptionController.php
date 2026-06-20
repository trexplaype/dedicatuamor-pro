<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LinkOption;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminLinkOptionController extends Controller
{
    public function index()
    {
        return LinkOption::orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public function show(LinkOption $linkOption)
    {
        return $linkOption;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'slug' => 'required|string|max:255|unique:link_options,slug',
            'label' => 'required|string|max:255',
            'plan_level' => 'required|string|max:50',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $data['slug'] = Str::slug($data['slug']);

        return LinkOption::create($data);
    }

    public function update(Request $request, LinkOption $linkOption)
    {
        $data = $request->validate([
            'slug' => 'required|string|max:255|unique:link_options,slug,'.$linkOption->id,
            'label' => 'required|string|max:255',
            'plan_level' => 'required|string|max:50',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $data['slug'] = Str::slug($data['slug']);

        $linkOption->update($data);

        return $linkOption->fresh();
    }

    public function destroy(LinkOption $linkOption)
    {
        $linkOption->delete();

        return response()->json([
            'success' => true,
        ]);
    }
}
