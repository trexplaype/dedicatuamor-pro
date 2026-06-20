import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { navLinks } from "../data/navLinks";
import Button from "./Button";
import UserMenu from "./UserMenu";

import { useAuth } from "../hooks/useAuth";
import { getUser } from "../services/userService";

export default function Header() {
  const { isAuthenticated } = useAuth();

  const [coins, setCoins] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!isAuthenticated) return;

        const user = await getUser();
        setCoins(user?.coins || 0);
      } catch (error) {
        console.error(error);
      }
    };

    loadUser();
  }, [isAuthenticated]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header
        className={`site-header ${
          isAuthenticated ? "auth-header" : "guest-header"
        }`}
      >
        <nav className="nav-shell professional-nav">
          <Link className="brand brand-lockup" to="/" onClick={closeMenu}>
            <span className="brand-logo">DEV AGS</span>
          </Link>

          <div className="nav-links">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className="nav-link"
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="nav-actions">
            {isAuthenticated && (
              <>
                <Link className="credits-pill" to="/wallet">
                  <span className="header-coin-icon">🪙</span>

                  <div className="credits-info">
                    <strong>{coins}</strong>
                    <small>Mi billetera</small>
                  </div>
                </Link>

                <Link className="rewards-pill" to="/rewards">
                  <span>🎁</span>
                  <strong>Ganar monedas</strong>
                </Link>

                <button
                  type="button"
                  className="mobile-toggle"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  aria-label="Abrir menú"
                >
                  {menuOpen ? "✕" : "☰"}
                </button>

                <UserMenu />
              </>
            )}

            {!isAuthenticated && (
              <>
                <Link className="login-link" to="/login">
                  Iniciar sesión
                </Link>

                <Button to="/register">Registrarse</Button>
              </>
            )}
          </div>
        </nav>
      </header>

      {isAuthenticated && (
        <>
          <div className={`mobile-menu-panel ${menuOpen ? "open" : ""}`}>
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className="mobile-menu-link"
                onClick={closeMenu}
              >
                <span>{item.icon}</span>
                <strong>{item.label}</strong>
              </NavLink>
            ))}

            <NavLink
              to="/wallet"
              className="mobile-menu-link"
              onClick={closeMenu}
            >
              <span>🪙</span>
              <strong>Mi billetera</strong>
            </NavLink>

            <NavLink
              to="/rewards"
              className="mobile-menu-link"
              onClick={closeMenu}
            >
              <span>🎁</span>
              <strong>Ganar monedas</strong>
            </NavLink>
          </div>

          {menuOpen && (
            <button
              type="button"
              className="mobile-menu-backdrop"
              onClick={closeMenu}
              aria-label="Cerrar menú"
            />
          )}
        </>
      )}
    </>
  );
}
