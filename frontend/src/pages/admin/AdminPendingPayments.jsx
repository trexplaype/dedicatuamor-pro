import { useEffect, useState } from "react";

import {
  getPendingPayments,
  approvePayment,
  rejectPayment,
} from "../../services/admin/adminService";

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
    const ok = confirm("¿Aprobar este pago y agregar monedas?");
    if (!ok) return;

    try {
      const data = await approvePayment(id);
      alert(data.message);
      loadPayments();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleReject = async (id) => {
    const ok = confirm("¿Rechazar este pago?");
    if (!ok) return;

    try {
      const data = await rejectPayment(id);
      alert(data.message);
      loadPayments();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <section>
      <div className="admin-page-header">
        <h1>💳 Pagos pendientes</h1>
        <p>Pagos manuales que esperan aprobación.</p>
      </div>

      {error && <div className="form-error">{error}</div>}

      {!error && payments.length === 0 && (
        <div className="admin-empty">No hay pagos pendientes.</div>
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
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>#{payment.id}</td>
                  <td>#{payment.user?.id || payment.user_id || "N/A"}</td>
                  <td>{payment.user?.name || "Usuario"}</td>
                  <td>{payment.user?.email || "Sin correo"}</td>
                  <td>S/ {payment.amount}</td>
                  <td>{payment.coins}</td>
                  <td>{payment.status}</td>

                  <td>
                    <div className="payments-actions">
                      <button
                        type="button"
                        className="approve-btn"
                        onClick={() => handleApprove(payment.id)}
                      >
                        Aprobar
                      </button>

                      <button
                        type="button"
                        className="reject-btn"
                        onClick={() => handleReject(payment.id)}
                      >
                        Rechazar
                      </button>
                    </div>
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
