import { Link, NavLink } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <Link to="/" className="admin-logo">
        <span>DEV</span> AGS
      </Link>

      <nav className="admin-nav">
        <p className="admin-nav-title">Principal</p>

        <NavLink to="/admin" end>
          <span>📊</span> Dashboard
        </NavLink>

        <NavLink to="/admin/settings">
          <span>⚙️</span> Configuración
        </NavLink>

        <NavLink to="/admin/users">
          <span>👥</span> Usuarios
        </NavLink>

        <NavLink to="/admin/analytics">
          <span>📈</span> Analíticas
        </NavLink>

        <NavLink to="/admin/rewards">
          <span>🎁</span> Recompensas
        </NavLink>

        <p className="admin-nav-title">Contenido</p>

        <NavLink to="/admin/template-categories">
          <span>❤️</span> Categorías
        </NavLink>

        <NavLink to="/admin/templates">
          <span>📋</span> Plantillas
        </NavLink>

        <NavLink to="/admin/templates/create">
          <span>🧩</span> Crear Plantilla
        </NavLink>

        <p className="admin-nav-title">Publicación</p>

        <NavLink to="/admin/link-options">
          <span>🔗</span> Enlaces Públicos
        </NavLink>

        <NavLink to="/admin/qr-styles">
          <span>📱</span> Diseños QR
        </NavLink>

        <NavLink to="/admin/published-pages">
          <span>🌍</span> Páginas Publicadas
        </NavLink>

        <NavLink to="/admin/user-pages">
          <span>📄</span> Páginas
        </NavLink>

        <NavLink to="/admin/purchased-templates">
          <span>🛒</span> Plantillas Compradas
        </NavLink>

        <p className="admin-nav-title">Planes</p>

        <NavLink to="/admin/plans">
          <span>💎</span> Gestionar Planes
        </NavLink>

        <NavLink to="/admin/plans/create">
          <span>➕</span> Crear Plan
        </NavLink>

        <NavLink to="/admin/subscriptions">
          <span>📅</span> Suscripciones
        </NavLink>

        <p className="admin-nav-title">Pagos</p>

        <NavLink to="/admin/payments/pending">
          <span>⏳</span> Pendientes
        </NavLink>

        <NavLink to="/admin/payments/approved">
          <span>✅</span> Aceptados
        </NavLink>

        <NavLink to="/admin/payments/rejected">
          <span>❌</span> Rechazados
        </NavLink>

        <NavLink to="/admin/payments/expired">
          <span>⌛</span> Expirados
        </NavLink>
      </nav>

      <Link to="/" className="admin-back-button">
        ← Volver al sitio
      </Link>
    </aside>
  );
}
