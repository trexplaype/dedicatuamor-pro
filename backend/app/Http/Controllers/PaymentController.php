<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function manualCoins(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'coins' => 'required|integer|min:1',
            'operation_number' => 'nullable|string|max:100',
        ]);

        $payment = Payment::create([
            'user_id' => $request->user()->id,
            'type' => 'coins',
            'method' => 'yape_manual',
            'status' => 'pending',
            'amount' => $request->amount,
            'coins' => $request->coins,
            'operation_number' => $request->operation_number,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pago registrado correctamente. Espera aprobación del admin.',
            'payment' => $payment,
        ]);
    }

    public function myPayments(Request $request)
    {
        return response()->json(
            $request->user()
                ->payments()
                ->latest()
                ->get()
        );
    }

    public function dashboard()
    {
        return response()->json([
            'users_count' => User::count(),
            'pending_payments_count' => Payment::where('status', 'pending')->count(),
            'approved_payments_count' => Payment::whereIn('status', ['paid', 'approved'])->count(),
            'rejected_payments_count' => Payment::where('status', 'rejected')->count(),
            'expired_payments_count' => Payment::where('status', 'expired')->count(),
            'coins_sold' => Payment::whereIn('status', ['paid', 'approved'])->sum('coins'),
            'total_income' => Payment::whereIn('status', ['paid', 'approved'])->sum('amount'),
        ]);
    }

    public function users()
    {
        return response()->json(
            User::select(
                'id',
                'public_id',
                'name',
                'email',
                'role',
                'coins',
                'created_at'
            )
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
        return response()->json(
            Payment::with('user:id,public_id,name,email')
                ->whereIn('status', ['paid', 'approved'])
                ->latest()
                ->get()
        );
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
            Payment::with('user:id,public_id,name,email')
                ->where('status', $status)
                ->latest()
                ->get()
        );
    }

    public function approvePayment(Payment $payment)
    {
        if ($payment->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Este pago ya fue procesado.',
            ], 400);
        }

        $payment->status = 'paid';
        $payment->save();

        if ($payment->type === 'coins') {
            $user = $payment->user;

            $user->coins = ($user->coins ?? 0) + $payment->coins;

            if (! $user->first_purchase_completed) {
                $user->first_purchase_completed = true;
            }

            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Pago aprobado y monedas agregadas.',
            'payment' => $payment->load('user:id,public_id,name,email'),
        ]);
    }

    public function rejectPayment(Payment $payment)
    {
        if ($payment->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Este pago ya fue procesado.',
            ], 400);
        }

        $payment->status = 'rejected';
        $payment->save();

        return response()->json([
            'success' => true,
            'message' => 'Pago rechazado.',
            'payment' => $payment->load('user:id,public_id,name,email'),
        ]);
    }
}
