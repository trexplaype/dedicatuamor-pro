import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import API_URL from "../services/api";
import { getUserPages } from "../services/userPageService";
import { getMyPayments } from "../services/paymentService";

const planNames = {
  free: "Gratis",
  standard: "Gratis",
  premium: "Premium",
  vip: "VIP",
  exclusive: "Super User",
  "super-user": "Super User",
};

const planIcons = {
  free: "✨",
  standard: "✨",
  premium: "👑",
  vip: "💎",
  exclusive: "🚀",
  "super-user": "🚀",
};

const statusLabels = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  expired: "Expirado",
};

function isToday(dateValue) {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function buildUrl(path) {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_URL}${path}`;
}

export default function MyPages() {
  const [tab, setTab] = useState("pages");
  const [pages, setPages] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [openTemplateId, setOpenTemplateId] = useState(null);

  const { user } = useAuth();

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const currentUser = {
    ...storedUser,
    ...user,
  };

  const activePlan = currentUser?.active_plan || "free";
  const activePlanName = planNames[activePlan] || "Gratis";
  const activePlanIcon = planIcons[activePlan] || "✨";

  const isFreePlan =
    !activePlan || activePlan === "free" || activePlan === "standard";

  useEffect(() => {
    loadPages();
    loadPayments();
  }, []);

  const loadPages = async () => {
    try {
      const data = await getUserPages();
      setPages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando páginas:", error);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      const data = await getMyPayments();
      setPayments(Array.isArray(data) ? data : data.payments || []);
    } catch (error) {
      console.error("Error cargando pagos:", error);
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const todayPagesCount = useMemo(() => {
    return pages.filter((page) => isToday(page.created_at)).length;
  }, [pages]);

  const remainingTodayPages = Math.max(2 - todayPagesCount, 0);

  const groupedPages = useMemo(() => {
    const groups = {};

    pages.forEach((page) => {
      const templateId =
        page.template_id || page.template?.id || "sin-plantilla";

      const templateTitle =
        page.template?.title ||
        page.template?.name ||
        page.template_title ||
        page.template_name ||
        page.template?.slug ||
        "Plantilla sin nombre";

      if (!groups[templateId]) {
        groups[templateId] = {
          templateId,
          templateTitle,
          pages: [],
        };
      }

      groups[templateId].pages.push(page);
    });

    return Object.values(groups);
  }, [pages]);

  const toggleTemplate = (templateId) => {
    setOpenTemplateId((current) =>
      current === templateId ? null : templateId,
    );
  };

  const formatDate = (date) => {
    if (!date) return "Sin fecha";

    return new Date(date).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getEditorUrl = (page) => {
    return buildUrl(page.template?.editor_url);
  };

  const getPreviewUrl = (page) => {
    return buildUrl(page.template?.preview_url);
  };

  return (
    <main className="panel-main">
      <section className="panel-shell">
        <div className="panel-top">
          <div>
            <h1>Mi panel</h1>
            <p>
              Hola, {currentUser?.name || "Usuario"}. Administra tus páginas,
              planes y pagos.
            </p>
          </div>

          <Button to="/templates" className="panel-create">
            + Crear página
          </Button>
        </div>

        <div className="panel-tabs">
          <button
            className={tab === "pages" ? "active" : ""}
            type="button"
            onClick={() => setTab("pages")}
          >
            Mis Páginas <span>{pages.length}</span>
          </button>

          <button
            className={tab === "plans" ? "active" : ""}
            type="button"
            onClick={() => setTab("plans")}
          >
            Mis planes
          </button>

          <button
            className={tab === "payments" ? "active" : ""}
            type="button"
            onClick={() => setTab("payments")}
          >
            Pagos <span>{payments.length}</span>
          </button>
        </div>

        {tab === "pages" && (
          <div className="panel-content active">
            <div className="active-plan-panel">
              <div className="active-plan-glow"></div>

              <div className="active-plan-content">
                <span className="active-plan-badge">Resumen de uso</span>

                <div className="active-plan-head">
                  <div>
                    <h3>
                      Plan <span>{activePlanName}</span>
                    </h3>

                    {isFreePlan ? (
                      <p>
                        Puedes crear 2 páginas gratis al día. Hoy usaste{" "}
                        {Math.min(todayPagesCount, 2)}/2.
                      </p>
                    ) : (
                      <p>
                        Tu plan {activePlanName} está activo. Puedes crear más
                        páginas según los beneficios de tu suscripción.
                      </p>
                    )}
                  </div>

                  <div className="active-plan-icon">{activePlanIcon}</div>
                </div>

                <div className="active-plan-stats">
                  <div className="active-plan-stat">
                    <small>Usadas hoy</small>
                    <strong>
                      {isFreePlan
                        ? `${Math.min(todayPagesCount, 2)}/2`
                        : todayPagesCount}
                    </strong>
                  </div>

                  <div className="active-plan-stat">
                    <small>Disponibles hoy</small>
                    <strong>
                      {isFreePlan ? remainingTodayPages : "Según plan"}
                    </strong>
                  </div>

                  <div className="active-plan-stat">
                    <small>Total páginas</small>
                    <strong>{pages.length}</strong>
                  </div>
                </div>

                {isFreePlan && remainingTodayPages === 0 && (
                  <div
                    style={{
                      marginTop: "14px",
                      padding: "12px 14px",
                      borderRadius: "14px",
                      background: "rgba(255, 80, 120, .14)",
                      border: "1px solid rgba(255, 80, 120, .28)",
                      color: "#fff",
                    }}
                  >
                    ⚠ Ya alcanzaste tu límite gratuito de hoy.
                    <div style={{ marginTop: "10px" }}>
                      <Button to="/plans" className="button-primary">
                        Comprar plan
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="empty-panel large">
                <h2>Cargando páginas...</h2>
              </div>
            ) : pages.length === 0 ? (
              <div className="empty-panel large">
                <div className="empty-icon">▣</div>
                <h2>Aún no tienes páginas</h2>
                <p>Crea tu primera página personalizada en minutos</p>
                <Button to="/templates">+ Crear mi primera página</Button>
              </div>
            ) : (
              <div className="template-pages-accordion">
                {groupedPages.map((group) => {
                  const isOpen = openTemplateId === group.templateId;

                  return (
                    <article
                      className="template-pages-group"
                      key={group.templateId}
                    >
                      <button
                        type="button"
                        className="template-pages-header"
                        onClick={() => toggleTemplate(group.templateId)}
                      >
                        <div className="template-pages-info">
                          <div className="template-pages-icon">💌</div>

                          <div>
                            <h3>{group.templateTitle}</h3>
                            <p>{group.pages.length} de 5 páginas creadas</p>
                          </div>
                        </div>

                        <div className="template-pages-right">
                          <span
                            className={
                              group.pages.length >= 5
                                ? "limit-badge full"
                                : "limit-badge"
                            }
                          >
                            {group.pages.length}/5
                          </span>

                          <span className="accordion-arrow">
                            {isOpen ? "⌃" : "⌄"}
                          </span>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="template-pages-list">
                          {group.pages.map((page) => {
                            const editorUrl = getEditorUrl(page);
                            const previewUrl = getPreviewUrl(page);

                            return (
                              <div className="template-page-row" key={page.id}>
                                <div>
                                  <h4>{page.title}</h4>
                                  <p>
                                    {page.is_published
                                      ? "Publicado"
                                      : "Borrador"}
                                  </p>
                                </div>

                                <div className="template-page-actions">
                                  <Button
                                    to={`/editor/${page.id}`}
                                    className="button-edit-page"
                                  >
                                    Editar
                                  </Button>

                                  {previewUrl ? (
                                    <a
                                      href={previewUrl}
                                      className="button button-secondary"
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Ver
                                    </a>
                                  ) : (
                                    <Button
                                      to={`/p/${page.slug}`}
                                      variant="secondary"
                                    >
                                      Ver
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "plans" && (
          <div className="panel-content active">
            <div className="active-plan-panel">
              <div className="active-plan-glow"></div>

              <div className="active-plan-content">
                <span className="active-plan-badge">Plan actual</span>

                <div className="active-plan-head">
                  <div>
                    <h3>
                      Suscripción <span>{activePlanName}</span>
                    </h3>

                    <p>
                      {isFreePlan
                        ? "Actualmente estás usando el acceso gratis."
                        : `Tu plan ${activePlanName} está activo y listo para usar.`}
                    </p>
                  </div>

                  <div className="active-plan-icon">{activePlanIcon}</div>
                </div>

                <div className="active-plan-stats">
                  <div className="active-plan-stat">
                    <small>Estado</small>
                    <strong>Activo</strong>
                  </div>

                  <div className="active-plan-stat">
                    <small>Monedas</small>
                    <strong>{currentUser?.coins ?? 0} 🪙</strong>
                  </div>

                  <div className="active-plan-stat">
                    <small>Páginas</small>
                    <strong>{pages.length}</strong>
                  </div>
                </div>

                <div className="active-plan-actions">
                  <Button to="/plans">Ver planes →</Button>

                  <Button to="/templates" variant="secondary">
                    Crear página
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "payments" && (
          <div className="panel-content active">
            {paymentsLoading ? (
              <div className="empty-panel large payments-empty">
                <h2>Cargando pagos...</h2>
              </div>
            ) : payments.length === 0 ? (
              <div className="empty-panel large payments-empty">
                <div className="empty-icon">▤</div>
                <h2>No tienes pagos registrados</h2>
                <p>Tus pagos aparecerán aquí</p>
              </div>
            ) : (
              <div className="payments-panel">
                <div className="payments-panel-head">
                  <div>
                    <span className="active-plan-badge">Historial</span>
                    <h3>Mis pagos</h3>
                    <p>Revisa tus recargas, planes y movimientos.</p>
                  </div>

                  <div className="payments-count">{payments.length}</div>
                </div>

                <div className="payments-list">
                  {payments.map((payment) => (
                    <article className="payment-card" key={payment.id}>
                      <div className="payment-left">
                        <div className="payment-icon">🪙</div>

                        <div>
                          <h4>
                            {payment.plan_name ||
                              payment.type ||
                              "Pago de monedas"}
                          </h4>

                          <p>
                            Operación:{" "}
                            {payment.operation_number || "Sin número"}
                          </p>

                          <small>{formatDate(payment.created_at)}</small>
                        </div>
                      </div>

                      <div className="payment-right">
                        <strong>{payment.coins || 0} 🪙</strong>

                        <span className={`payment-status ${payment.status}`}>
                          {statusLabels[payment.status] || payment.status}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
