<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserPage;
use Illuminate\Http\Request;

class AdminUserPageController extends Controller
{
    public function index(Request $request)
    {
        $pages = UserPage::with([
            'user:id,name,email,public_id',
            'template:id,name,title,slug,category',
            'plan:id,name,slug',
            'userTemplate:id,user_id,template_id,purchased_at,expires_at,page_duration_value,page_duration_unit,admin_retention_days',
        ])
            ->latest()
            ->get()
            ->map(function ($page) {
                $deleteAt = null;

                if ($page->expires_at) {
                    $deleteAt = $page->expires_at
                        ->copy()
                        ->addDays((int) ($page->admin_retention_days ?? 3));
                }

                return [
                    'id' => $page->id,
                    'title' => $page->title,
                    'slug' => $page->slug,
                    'status' => $page->status,
                    'is_published' => (bool) $page->is_published,

                    'source' => $page->user_template_id ? 'template_purchase' : 'plan',
                    'source_label' => $page->user_template_id ? 'Plantilla comprada' : 'Plan',

                    'created_at' => $page->created_at,
                    'published_at' => $page->published_at,
                    'expires_at' => $page->expires_at,
                    'admin_retention_days' => (int) ($page->admin_retention_days ?? 3),
                    'delete_at' => $deleteAt,

                    'user' => $page->user,
                    'template' => $page->template,
                    'plan' => $page->plan,
                    'user_template' => $page->userTemplate,

                    'public_url' => $page->public_url,
                ];
            });

        return response()->json($pages);
    }

    public function restore(Request $request, UserPage $page)
    {
        $request->validate([
            'expires_at' => 'required|date|after:now',
            'admin_retention_days' => 'nullable|integer|min:0|max:365',
        ]);

        $page->update([
            'status' => 'published',
            'is_published' => true,
            'expires_at' => $request->expires_at,
            'admin_retention_days' => $request->admin_retention_days ?? $page->admin_retention_days,
        ]);

        return response()->json([
            'message' => 'Página recuperada correctamente.',
            'page' => $page->load(['user', 'template', 'plan', 'userTemplate']),
        ]);
    }

    public function extend(Request $request, UserPage $page)
    {
        $request->validate([
            'expires_at' => 'required|date|after:now',
            'admin_retention_days' => 'nullable|integer|min:0|max:365',
        ]);

        $page->update([
            'expires_at' => $request->expires_at,
            'admin_retention_days' => $request->admin_retention_days ?? $page->admin_retention_days,
        ]);

        return response()->json([
            'message' => 'Expiración actualizada correctamente.',
            'page' => $page->load(['user', 'template', 'plan', 'userTemplate']),
        ]);
    }

    public function destroy(UserPage $page)
    {
        foreach ($page->assets as $asset) {
            if (
                $asset->source_type === 'upload' &&
                $asset->file_path &&
                file_exists(storage_path('app/public/'.$asset->file_path))
            ) {
                unlink(storage_path('app/public/'.$asset->file_path));
            }

            $asset->delete();
        }

        $page->delete();

        return response()->json([
            'message' => 'Página eliminada definitivamente.',
        ]);
    }
}
