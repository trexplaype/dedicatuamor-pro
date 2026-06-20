import { useEffect, useState } from "react";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";

import API_URL from "../services/api";

export default function MyPages() {
  const [tab, setTab] = useState("pages");
  const [templates, setTemplates] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const token = localStorage.getItem("apiToken");

        const response = await fetch(`${API_URL}/api/my-templates`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error("Error cargando plantillas:", error);
      }
    };

    loadTemplates();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Sin fecha";
    return new Date(date).toLocaleDateString("es-PE");
  };

  return (
    <main className="panel-main">
      <section className="panel-shell">
        <div className="panel-top">
          <div>
            <h1>Mi panel</h1>
            <p>
              Hola, {user?.name || "Usuario"}. Administra tus páginas, planes y
              pagos.
            </p>
          </div>

          <Button to="/templates" className="panel-create">
            + Crear página
          </Button>
        </div>

        <div className="panel-tabs" role="tablist">
          <button
            className={tab === "pages" ? "active" : ""}
            type="button"
            onClick={() => setTab("pages")}
          >
            Mis Páginas <span>0</span>
          </button>

          <button
            className={tab === "plans" ? "active" : ""}
            type="button"
            onClick={() => setTab("plans")}
          >
            Mis planes <span>{templates.length}</span>
          </button>

          <button
            className={tab === "payments" ? "active" : ""}
            type="button"
            onClick={() => setTab("payments")}
          >
            Pagos
          </button>
        </div>

        {tab === "pages" && (
          <div className="panel-content active">
            <div className="empty-panel large">
              <div className="empty-icon">▣</div>
              <h2>Aún no tienes páginas</h2>
              <p>Crea tu primera página personalizada en minutos</p>
              <Button to="/templates">+ Crear mi primera página</Button>
            </div>
          </div>
        )}

        {tab === "plans" && (
          <div className="panel-content active">
            <div className="plan-panel-section">
              <div className="panel-section-heading">
                <h2>Páginas compradas</h2>
                <a href="/templates">Comprar más →</a>
              </div>

              {templates.length === 0 ? (
                <div className="empty-panel compact">
                  <p>No tienes compras de páginas</p>
                  <a href="/templates">Ver plantillas →</a>
                </div>
              ) : (
                <div className="purchased-list">
                  {templates.map((template) => (
                    <div className="purchased-card" key={template.id}>
                      <div>
                        <h3>{template.title || template.name}</h3>
                        <p>Plantilla activa</p>
                      </div>

                      <div className="expires-badge">
                        Vence: {formatDate(template.pivot?.expires_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "payments" && (
          <div className="panel-content active">
            <div className="empty-panel large payments-empty">
              <div className="empty-icon">▤</div>
              <h2>No tienes pagos registrados</h2>
              <p>Tus pagos aparecerán aquí</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
