import { useEffect, useState } from "react";
import {
  getAdminSubscriptions,
  updateAdminSubscription,
  deleteAdminSubscription,
} from "../../services/admin/adminSubscriptionService";

export default function AdminSubscriptions() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setItems(await getAdminSubscriptions());
  }

  async function changeStatus(item, status) {
    await updateAdminSubscription(item.id, { status });
    load();
  }

  async function remove(id) {
    if (!window.confirm("¿Eliminar suscripción?")) return;
    await deleteAdminSubscription(id);
    load();
  }

  return (
    <main className="panel-main">
      <section className="panel-shell">
        <h1>Suscripciones</h1>

        <div className="dashboard-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Plan</th>
                  <th>Estado</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Pago</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.user?.name || item.user_id}</td>
                    <td>{item.plan?.name || item.plan_slug}</td>
                    <td>{item.status}</td>
                    <td>{item.starts_at || "-"}</td>
                    <td>{item.expires_at || "-"}</td>
                    <td>{item.paid_with || "-"}</td>
                    <td>
                      <button
                        className="mini-btn"
                        onClick={() => changeStatus(item, "active")}
                      >
                        Activar
                      </button>
                      <button
                        className="mini-btn"
                        onClick={() => changeStatus(item, "expired")}
                      >
                        Expirar
                      </button>
                      <button
                        className="mini-btn danger"
                        onClick={() => remove(item.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
