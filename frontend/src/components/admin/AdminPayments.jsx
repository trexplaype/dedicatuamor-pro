import { useEffect, useState } from "react";

import {
  getPendingPayments,
  approvePayment,
  rejectPayment,
} from "../../services/adminPaymentService";

export default function AdminPendingPayments() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");

  const loadPayments = async () => {
    try {
      const data = await getPendingPayments();

      if (!Array.isArray(data)) {
        setPayments([]);
        setError(data.message || "No autorizado");
        return;
      }

      setError("");
      setPayments(data);
    } catch (error) {
      console.error(error);
      setError("Error al cargar pagos pendientes");
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleApprove = async (id) => {
    const data = await approvePayment(id);
    alert(data.message);
    loadPayments();
  };

  const handleReject = async (id) => {
    const data = await rejectPayment(id);
    alert(data.message);
    loadPayments();
  };

  return (
    <section className="dashboard-card">
      <h1>💳 Pagos pendientes</h1>

      {error && <div className="form-error">{error}</div>}

      {!error && payments.length === 0 && (
        <div className="wallet-history-empty">No hay pagos pendientes.</div>
      )}

      {!error && payments.length > 0 && (
        <div className="payments-table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                <th>ID Recarga</th>
                <th>ID Usuario</th>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Monto</th>
                <th>Monedas</th>
                <th>Operación</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>#{payment.id}</td>
                  <td>#{payment.user?.id || "N/A"}</td>
                  <td>{payment.user?.name || "Usuario"}</td>
                  <td>{payment.user?.email || "Sin correo"}</td>
                  <td>S/ {payment.amount}</td>
                  <td>{payment.coins}</td>
                  <td>{payment.operation_number || "Sin número"}</td>

                  <td className="payments-actions">
                    <button
                      className="approve-btn"
                      onClick={() => handleApprove(payment.id)}
                    >
                      Aprobar
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() => handleReject(payment.id)}
                    >
                      Rechazar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
