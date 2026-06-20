import { useEffect, useState } from "react";
import { getExpiredPayments } from "../../services/admin/adminService";

export default function AdminExpiredPayments() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getExpiredPayments()
      .then(setPayments)
      .catch(() => setError("Error al cargar pagos expirados"));
  }, []);

  return (
    <section>
      <div className="admin-page-header">
        <h1>⌛ Pagos expirados</h1>
        <p>Pagos que vencieron sin ser confirmados.</p>
      </div>

      {error && <div className="form-error">{error}</div>}

      {!error && (
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
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="admin-empty">
                    No hay pagos expirados todavía.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>#{payment.id}</td>
                    <td>#{payment.user?.id || payment.user_id || "N/A"}</td>
                    <td>{payment.user?.name || "Usuario"}</td>
                    <td>{payment.user?.email || "Sin correo"}</td>
                    <td>S/ {payment.amount}</td>
                    <td>{payment.coins}</td>
                    <td>{payment.operation_number || "Sin número"}</td>
                    <td>{payment.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
