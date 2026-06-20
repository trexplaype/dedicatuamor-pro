import { useEffect, useState } from "react";
import { getAdminAnalytics } from "../../services/admin/adminAnalyticsService";

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminAnalytics()
      .then(setAnalytics)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando analíticas...</p>;
  if (error) return <p>{error}</p>;

  const summary = analytics?.summary || {};

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <h1>📈 Analíticas</h1>
        <p>Resumen de usuarios, ingresos, plantillas, planes y Super User.</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span>👥</span>
          <h3>Usuarios</h3>
          <strong>{summary.users_count || 0}</strong>
        </div>

        <div className="admin-stat-card">
          <span>📋</span>
          <h3>Plantillas</h3>
          <strong>{summary.templates_count || 0}</strong>
        </div>

        <div className="admin-stat-card">
          <span>💌</span>
          <h3>Páginas creadas</h3>
          <strong>{summary.pages_count || 0}</strong>
        </div>

        <div className="admin-stat-card">
          <span>💎</span>
          <h3>Suscripciones activas</h3>
          <strong>{summary.subscriptions_active || 0}</strong>
        </div>

        <div className="admin-stat-card">
          <span>🪙</span>
          <h3>Monedas vendidas</h3>
          <strong>{summary.coins_sold || 0}</strong>
        </div>

        <div className="admin-stat-card">
          <span>💰</span>
          <h3>Ingresos</h3>
          <strong>S/ {summary.total_income || 0}</strong>
        </div>

        <div className="admin-stat-card">
          <span>🔥</span>
          <h3>Super User este mes</h3>
          <strong>
            {summary.super_user_monthly_used || 0}/
            {summary.super_user_monthly_limit || 0}
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>🎯</span>
          <h3>Cupos disponibles</h3>
          <strong>{summary.super_user_monthly_available ?? "-"}</strong>
        </div>
      </div>

      <br />

      <div className="admin-card">
        <h2>💎 Planes más vendidos</h2>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Total suscripciones</th>
              </tr>
            </thead>

            <tbody>
              {(analytics?.plans_stats || []).map((item) => (
                <tr key={item.plan_slug}>
                  <td>{item.plan_slug}</td>
                  <td>{item.total}</td>
                </tr>
              ))}

              {(analytics?.plans_stats || []).length === 0 && (
                <tr>
                  <td colSpan="2" className="admin-empty">
                    No hay suscripciones todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <br />

      <div className="admin-card">
        <h2>📋 Plantillas más usadas</h2>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Plantilla</th>
                <th>Páginas creadas</th>
              </tr>
            </thead>

            <tbody>
              {(analytics?.templates_usage || []).map((item) => (
                <tr key={item.template_id}>
                  <td>
                    {item.template?.title ||
                      item.template?.name ||
                      `Plantilla #${item.template_id}`}
                  </td>
                  <td>{item.pages_count}</td>
                </tr>
              ))}

              {(analytics?.templates_usage || []).length === 0 && (
                <tr>
                  <td colSpan="2" className="admin-empty">
                    No hay páginas creadas todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
