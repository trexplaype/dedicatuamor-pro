import { useEffect, useMemo, useState } from "react";
import { request } from "../../services/api";

export default function AdminPurchasedTemplates() {
  const [tab, setTab] = useState("purchases");
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData(page = 1, currentTab = tab) {
    try {
      setLoading(true);
      setError("");

      const endpoint =
        currentTab === "subscriptions"
          ? `/api/admin/subscriptions?page=${page}`
          : `/api/admin/purchased-templates?page=${page}`;

      const data = await request(endpoint);

      const list = Array.isArray(data) ? data : data.data || data.items || [];

      setItems(list);
      setMeta(data.current_page ? data : null);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los accesos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(1, tab);
  }, [tab]);

  function changeTab(nextTab) {
    if (nextTab === tab) {
      loadData(1, nextTab);
      return;
    }

    setTab(nextTab);
  }

  function isActive(expiresAt, status) {
    if (status && status !== "active") return false;
    if (!expiresAt) return true;
    return new Date(expiresAt) > new Date();
  }

  function formatDate(date) {
    if (!date) return "Sin vencimiento";

    return new Date(date).toLocaleString("es-PE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((item) =>
      isActive(item.expires_at, item.status),
    ).length;
    const expired = total - active;

    const coins = items.reduce((sum, item) => {
      if (tab === "subscriptions") {
        return sum + Number(item.amount_paid || item.plan_price || 0);
      }

      return sum + Number(item.price_paid || 0);
    }, 0);

    return { total, active, expired, coins };
  }, [items, tab]);

  function totalLabel() {
    return tab === "subscriptions" ? "Total suscripciones" : "Total compras";
  }

  function titleLabel() {
    return tab === "subscriptions"
      ? "Historial de suscripciones"
      : "Historial de compras individuales";
  }

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Accesos de Usuarios</h1>
          <p>
            Revisa accesos por compra individual o por suscripción, vencimientos
            y monedas generadas.
          </p>
        </div>

        <button className="admin-button" onClick={() => loadData()}>
          Actualizar
        </button>
      </div>

      <div className="admin-tabs">
        <button
          className={tab === "purchases" ? "active" : ""}
          onClick={() => changeTab("purchases")}
        >
          🛒 Compras Individuales
        </button>

        <button
          className={tab === "subscriptions" ? "active" : ""}
          onClick={() => changeTab("subscriptions")}
        >
          👑 Suscripciones
        </button>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <section className="admin-stats-grid">
        <article className="admin-stat-card">
          <span>{totalLabel()}</span>
          <strong>{stats.total}</strong>
        </article>

        <article className="admin-stat-card">
          <span>Activas</span>
          <strong>{stats.active}</strong>
        </article>

        <article className="admin-stat-card">
          <span>Expiradas</span>
          <strong>{stats.expired}</strong>
        </article>

        <article className="admin-stat-card">
          <span>Monedas generadas</span>
          <strong>{stats.coins} 🪙</strong>
        </article>
      </section>

      <section className="admin-card">
        <div className="admin-card-header">
          <h2>{titleLabel()}</h2>

          {meta && (
            <span>
              Página {meta.current_page} de {meta.last_page}
            </span>
          )}
        </div>

        {loading ? (
          <p>Cargando accesos...</p>
        ) : items.length === 0 ? (
          <p>No hay registros todavía.</p>
        ) : tab === "subscriptions" ? (
          <SubscriptionsTable
            items={items}
            isActive={isActive}
            formatDate={formatDate}
          />
        ) : (
          <PurchasesTable
            items={items}
            isActive={isActive}
            formatDate={formatDate}
          />
        )}

        {meta && meta.last_page > 1 && (
          <div className="admin-pagination">
            <button
              className="admin-button"
              disabled={!meta.prev_page_url}
              onClick={() => loadData(meta.current_page - 1)}
            >
              Anterior
            </button>

            <span>
              Página {meta.current_page} de {meta.last_page}
            </span>

            <button
              className="admin-button"
              disabled={!meta.next_page_url}
              onClick={() => loadData(meta.current_page + 1)}
            >
              Siguiente
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function PurchasesTable({ items, isActive, formatDate }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Tipo</th>
            <th>Plantilla</th>
            <th>Precio</th>
            <th>Compra</th>
            <th>Expira acceso</th>
            <th>Duración página</th>
            <th>Retención</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>#{item.id}</td>

              <td>
                <strong>{item.user_name || "Sin nombre"}</strong>
                <br />
                <small>{item.user_email}</small>
              </td>

              <td>🛒 Compra</td>

              <td>
                <strong>{item.template_title}</strong>
                <br />
                <small>{item.template_slug}</small>
              </td>

              <td>{Number(item.price_paid || 0)} 🪙</td>
              <td>{formatDate(item.purchased_at)}</td>
              <td>{formatDate(item.expires_at)}</td>

              <td>
                {item.page_duration_value || "—"}{" "}
                {item.page_duration_unit || ""}
              </td>

              <td>{item.admin_retention_days ?? 0} días</td>

              <td>
                {isActive(item.expires_at) ? (
                  <span className="admin-badge admin-badge-success">
                    Activa
                  </span>
                ) : (
                  <span className="admin-badge admin-badge-danger">
                    Expirada
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubscriptionsTable({ items, isActive, formatDate }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Tipo</th>
            <th>Plan</th>
            <th>Precio</th>
            <th>Inicio</th>
            <th>Expira</th>
            <th>Páginas/día</th>
            <th>Páginas máx.</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>#{item.id}</td>

              <td>
                <strong>
                  {item.user_name || item.user?.name || "Sin nombre"}
                </strong>
                <br />
                <small>{item.user_email || item.user?.email || "—"}</small>
              </td>

              <td>👑 Suscripción</td>

              <td>
                <strong>{item.plan_name || item.plan_slug || "—"}</strong>
                <br />
                <small>{item.access_level || item.plan_slug || "—"}</small>
              </td>

              <td>{Number(item.amount_paid || item.plan_price || 0)} 🪙</td>
              <td>{formatDate(item.starts_at || item.created_at)}</td>
              <td>{formatDate(item.expires_at)}</td>
              <td>{item.pages_per_day || item.max_pages_per_day || "—"}</td>
              <td>{item.max_pages || "—"}</td>

              <td>
                {isActive(item.expires_at, item.status) ? (
                  <span className="admin-badge admin-badge-success">
                    Activa
                  </span>
                ) : (
                  <span className="admin-badge admin-badge-danger">
                    Expirada
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
