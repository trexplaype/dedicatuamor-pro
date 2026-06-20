import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import API_URL from "../services/api";

export default function Footer() {
  const { isAuthenticated, logout } = useAuth();

  const [settings, setSettings] = useState({
    app_name: "DEV AGS",
    admin_whatsapp: "",
    contact_email: "",
    telegram_url: "",
    support_url: "",
    terms_url: "/terms",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/settings?t=${Date.now()}`, {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (response.ok && data) {
        setSettings({
          app_name: data.app_name || "DEV AGS",
          admin_whatsapp: data.admin_whatsapp || "",
          contact_email: data.contact_email || "",
          telegram_url: data.telegram_url || "",
          support_url: data.support_url || "",
          terms_url: data.terms_url || "/terms",
        });
      }
    } catch (error) {
      console.error("Error cargando footer:", error);
    }
  };

  const appName = settings.app_name || "DEV AGS";
  const whatsappUrl = settings.admin_whatsapp
    ? `https://wa.me/${settings.admin_whatsapp}`
    : "";
  const termsUrl = settings.terms_url || "/terms";

  return (
    <footer className="site-footer professional-footer">
      <div className="footer-brand">
        <Link className="brand brand-lockup" to="/">
          <span className="brand-mark">🐼</span>
          <span>{appName}</span>
        </Link>

        <p>
          Crea dedicatorias digitales memorables con plantillas interactivas,
          música, fotos y enlaces privados.
        </p>
      </div>

      <div>
        <h2>Navegación</h2>
        <Link to="/">Inicio</Link>
        <Link to="/templates">Plantillas</Link>
        <Link to="/plans">Planes</Link>
        <Link to="/wallet">Monedas de oro</Link>
      </div>

      <div>
        <h2>Cuenta</h2>

        {isAuthenticated ? (
          <>
            <Link to="/my-pages">Mis páginas</Link>
            <Link to="/wallet">Mi billetera</Link>

            <button
              type="button"
              className="footer-link-button"
              onClick={logout}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/register">Registrarse</Link>
          </>
        )}
      </div>

      <div>
        <h2>Contacto</h2>

        {settings.contact_email && (
          <a href={`mailto:${settings.contact_email}`}>
            {settings.contact_email}
          </a>
        )}

        {whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        )}

        {settings.telegram_url && (
          <a href={settings.telegram_url} target="_blank" rel="noreferrer">
            Telegram
          </a>
        )}

        {settings.support_url && (
          <a href={settings.support_url} target="_blank" rel="noreferrer">
            Soporte
          </a>
        )}
      </div>

      <div className="footer-bottom">
        <span>© 2026 {appName}. Todos los derechos reservados.</span>

        <span>
          <Link to={termsUrl}>Términos</Link> · Privacidad
        </span>
      </div>
    </footer>
  );
}
