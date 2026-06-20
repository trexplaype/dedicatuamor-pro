import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function UserMenu() {
  const [open, setOpen] = useState(false);

  const menuRef = useRef(null);

  const { user, logout } = useAuth();

  const name = user?.name || "Usuario";
  const email = user?.email || "usuario@email.com";
  const initial = name.charAt(0).toUpperCase();
  const coins = user?.coins ?? 0;

  useEffect(() => {
    const closeMenu = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenu);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
    };
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <div className="user-dropdown" ref={menuRef}>
      <button
        type="button"
        className="user-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="user-initial">{initial}</span>

        <span className="user-name">{name}</span>

        <span className="user-arrow">⌄</span>
      </button>

      {open && (
        <div className="user-menu">
          {/* HEADER */}

          <div className="user-menu-header">
            <div className="user-avatar-large">{initial}</div>

            <div className="user-info">
              <div className="user-fullname">{name}</div>

              <div className="user-email">{email}</div>

              <div className="user-coins">
                <span>🪙</span>
                <strong>{coins}</strong>
                <span>monedas</span>
              </div>
            </div>
          </div>

          {/* ADMIN */}

          {user?.role === "admin" && (
            <Link to="/admin" onClick={() => setOpen(false)}>
              <span>👑</span>
              Panel Admin
            </Link>
          )}

          {/* LINKS */}

          <Link to="/my-pages" onClick={() => setOpen(false)}>
            <span>📄</span>
            Mis Páginas
          </Link>

          <Link to="/wallet" onClick={() => setOpen(false)}>
            <span>💳</span>
            Mi Billetera
          </Link>

          <Link to="/subscribe-plan/premium" onClick={() => setOpen(false)}>
            <span>⭐</span>
            Planes subscripcion
          </Link>

          <Link to="/rewards" onClick={() => setOpen(false)}>
            <span>🎁</span>
            Recompensas
          </Link>

          <Link to="/templates" onClick={() => setOpen(false)}>
            <span>✨</span>
            Crear Página
          </Link>

          {/* LOGOUT */}

          <button type="button" className="logout-btn" onClick={handleLogout}>
            <span>↪</span>
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}
