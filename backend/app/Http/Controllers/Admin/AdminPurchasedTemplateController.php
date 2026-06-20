<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminPurchasedTemplateController extends Controller
{
    public function index(Request $request)
    {
        $items = DB::table('user_templates')
            ->join('users', 'users.id', '=', 'user_templates.user_id')
            ->join('templates', 'templates.id', '=', 'user_templates.template_id')
            ->select(
                'user_templates.id',
                'user_templates.user_id',
                'users.name as user_name',
                'users.email as user_email',
                'user_templates.template_id',
                'templates.title as template_title',
                'templates.slug as template_slug',
                'user_templates.price_paid',
                'user_templates.is_individual_purchase',
                'user_templates.purchased_at',
                'user_templates.expires_at',
                'user_templates.access_duration_value',
                'user_templates.access_duration_unit',
                'user_templates.page_duration_value',
                'user_templates.page_duration_unit',
                'user_templates.admin_retention_days',
                'user_templates.created_at'
            )
            ->orderByDesc('user_templates.created_at')
            ->paginate(20);

        return response()->json($items);
    }

    // 👇 PEGAR DEBAJO DE index()

    public function show($purchase)
    {
        $item = DB::table('user_templates')
            ->join('users', 'users.id', '=', 'user_templates.user_id')
            ->join('templates', 'templates.id', '=', 'user_templates.template_id')
            ->select(
                'user_templates.*',
                'users.name as user_name',
                'users.email as user_email',
                'templates.title as template_title',
                'templates.slug as template_slug',
                'templates.required_plan',
                'templates.price_coins'
            )
            ->where('user_templates.id', $purchase)
            ->first();

        if (! $item) {
            return response()->json([
                'message' => 'Compra no encontrada',
            ], 404);
        }

        return response()->json($item);
    }
}