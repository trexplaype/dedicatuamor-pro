import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboard } from "../../services/admin/adminService";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminDashboard()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Cargando dashboard...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <h1>🚀 Dashboard Admin</h1>

        <p>
          Gestión completa de usuarios, pagos, plantillas, planes y páginas.
        </p>
      </div>

      <div className="admin-stats-grid">
        <Link to="/admin/users" className="admin-stat-card">
          <span>👥</span>
          <h3>Usuarios</h3>
          <strong>{stats.users_count}</strong>
        </Link>

        <Link to="/admin/user-pages" className="admin-stat-card">
          <span>📄</span>
          <h3>Páginas</h3>
          <strong>Gestionar</strong>
        </Link>

        <Link to="/admin/templates" className="admin-stat-card">
          <span>📋</span>
          <h3>Plantillas</h3>
          <strong>Gestionar</strong>
        </Link>

        <Link to="/admin/templates/create" className="admin-stat-card">
          <span>🧩</span>
          <h3>Crear plantilla</h3>
          <strong>+</strong>
        </Link>

        <Link to="/admin/plans" className="admin-stat-card">
          <span>💎</span>
          <h3>Planes</h3>
          <strong>4</strong>
        </Link>

        <Link to="/admin/plans/create" className="admin-stat-card">
          <span>➕</span>
          <h3>Crear plan</h3>
          <strong>+</strong>
        </Link>

        <Link to="/admin/payments/pending" className="admin-stat-card">
          <span>⏳</span>
          <h3>Pendientes</h3>
          <strong>{stats.pending_payments_count}</strong>
        </Link>

        <Link to="/admin/payments/approved" className="admin-stat-card">
          <span>✅</span>
          <h3>Aprobados</h3>
          <strong>{stats.approved_payments_count}</strong>
        </Link>

        <Link to="/admin/payments/rejected" className="admin-stat-card">
          <span>❌</span>
          <h3>Rechazados</h3>
          <strong>{stats.rejected_payments_count}</strong>
        </Link>

        <Link to="/admin/payments/expired" className="admin-stat-card">
          <span>⌛</span>
          <h3>Expirados</h3>
          <strong>{stats.expired_payments_count}</strong>
        </Link>

        <Link to="/admin/payments/approved" className="admin-stat-card">
          <span>🪙</span>
          <h3>Monedas vendidas</h3>
          <strong>{stats.coins_sold}</strong>
        </Link>

        <Link to="/admin/payments/approved" className="admin-stat-card">
          <span>💰</span>
          <h3>Ingresos</h3>
          <strong>S/ {stats.total_income}</strong>
        </Link>
      </div>
    </section>
  );
}
