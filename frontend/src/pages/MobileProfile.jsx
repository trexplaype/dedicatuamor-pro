import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function MobileProfile() {
  const { user, logout } = useAuth();

  return (
    <div className="mobile-page">
      <div className="mobile-profile-card">
        <div className="mobile-profile-avatar">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <h2>{user?.name || "Usuario"}</h2>
        <p>ID {user?.public_id || "00000000"}</p>
      </div>

      <Link to="/plans" className="mobile-vip-banner">
        ✦ Ver planes VIP
      </Link>

      <div className="mobile-wallet-card">
        <span>🪙 Monedas</span>
        <strong>{user?.coins || 0}</strong>
      </div>

      <section id="notifications" className="mobile-profile-section">
        <h3>🔔 Notificaciones</h3>
        <p>No tienes notificaciones nuevas.</p>
      </section>

      <div className="mobile-menu-list">
        {user?.role === "admin" && (
          <Link to="/admin" className="mobile-admin-link">
            👑 Panel Admin
          </Link>
        )}

        <Link to="/my-pages">📖 Mis páginas</Link>
        <Link to="/rewards">🎁 Gana recompensas</Link>
        <a href="#notifications">🔔 Notificaciones</a>

        <button type="button" onClick={logout}>
          ↩ Cerrar sesión
        </button>
      </div>
    </div>
  );
}
