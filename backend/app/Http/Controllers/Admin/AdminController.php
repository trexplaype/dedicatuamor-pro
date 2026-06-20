<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;

class AdminController extends Controller
{
    public function dashboard()
    {
        return response()->json([
            'users_count' => User::count(),
            'pending_payments_count' => Payment::where('status', 'pending')->count(),
            'approved_payments_count' => Payment::where('status', 'approved')->count(),
            'coins_sold' => Payment::where('status', 'approved')->sum('coins'),
        ]);
    }

    public function users()
    {
        return response()->json(
            User::select('id', 'name', 'email', 'role', 'coins', 'created_at')
                ->latest()
                ->get()
        );
    }

    public function pendingPayments()
    {
        return $this->paymentsByStatus('pending');
    }

    public function approvedPayments()
    {
        return $this->paymentsByStatus('approved');
    }

    public function rejectedPayments()
    {
        return $this->paymentsByStatus('rejected');
    }

    public function expiredPayments()
    {
        return $this->paymentsByStatus('expired');
    }

    private function paymentsByStatus($status)
    {
        return response()->json(
            Payment::with('user:id,name,email')
                ->where('status', $status)
                ->latest()
                ->get()
        );
    }

    public function approvePayment(Payment $payment)
    {
        if ($payment->status !== 'pending') {
            return response()->json([
                'message' => 'Este pago ya fue procesado.',
            ], 400);
        }

        $payment->update([
            'status' => 'approved',
        ]);

        $payment->user->increment('coins', $payment->coins);

        return response()->json([
            'message' => 'Pago aprobado correctamente',
            'payment' => $payment->load('user:id,name,email'),
        ]);
    }

    public function rejectPayment(Payment $payment)
    {
        if ($payment->status !== 'pending') {
            return response()->json([
                'message' => 'Este pago ya fue procesado.',
            ], 400);
        }

        $payment->update([
            'status' => 'rejected',
        ]);

        return response()->json([
            'message' => 'Pago rechazado correctamente',
            'payment' => $payment->load('user:id,name,email'),
        ]);
    }
}
