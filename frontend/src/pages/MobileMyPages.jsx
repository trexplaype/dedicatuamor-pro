import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getUserPages } from "../services/userPageService";
import { getMyPayments } from "../services/paymentService";

const planNames = {
  free: "Gratis",
  standard: "Gratis",
  premium: "Premium",
  vip: "VIP",
  exclusive: "Super User",
};

const planIcons = {
  free: "✨",
  standard: "✨",
  premium: "👑",
  vip: "💎",
  exclusive: "🚀",
};

const statusLabels = {
  pending: "Pendiente",
  paid: "Aprobado",
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

function formatDate(date) {
  if (!date) return "Sin fecha";

  return new Date(date).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function MobileMyPages() {
  const { user } = useAuth();

  const [tab, setTab] = useState("pages");
  const [pages, setPages] = useState([]);
  const [payments, setPayments] = useState([]);
  const [openTemplateId, setOpenTemplateId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  const currentUser = {
    ...JSON.parse(localStorage.getItem("user") || "{}"),
    ...user,
  };

  const activePlan = currentUser?.active_plan || "free";
  const activePlanName = planNames[activePlan] || activePlan;
  const activePlanIcon = planIcons[activePlan] || "✨";

  const isFreePlan =
    !activePlan || activePlan === "free" || activePlan === "standard";

  useEffect(() => {
    loadPages();
    loadPayments();
  }, []);

  async function loadPages() {
    try {
      const data = await getUserPages();
      setPages(Array.isArray(data) ? data : data.pages || data.data || []);
    } catch (error) {
      console.error("Error cargando páginas:", error);
      setPages([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadPayments() {
    try {
      const data = await getMyPayments();
      setPayments(Array.isArray(data) ? data : data.payments || []);
    } catch (error) {
      console.error("Error cargando pagos:", error);
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  }

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
        page.template?.name ||
        page.template?.title ||
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

  function toggleTemplate(templateId) {
    setOpenTemplateId((current) =>
      current === templateId ? null : templateId,
    );
  }

  return (
    <div className="mobile-page">
      <div className="mobile-page-header">
        <h1>📖 Mis páginas</h1>
        <p>Administra tus páginas, planes y pagos.</p>
      </div>

      <div className="mobile-plan-summary">
        <span className="mobile-plan-badge">Resumen de uso</span>

        <div className="mobile-plan-head">
          <div>
            <h2>
              {activePlanIcon} Plan {activePlanName}
            </h2>

            {isFreePlan ? (
              <p>
                Puedes crear 2 páginas gratis al día. Hoy usaste{" "}
                {Math.min(todayPagesCount, 2)}/2.
              </p>
            ) : (
              <p>
                Tu plan {activePlanName} está activo. Puedes crear más páginas
                según los beneficios de tu suscripción.
              </p>
            )}
          </div>
        </div>

        <div className="mobile-plan-stats">
          <div>
            <small>Usadas hoy</small>
            <strong>
              {isFreePlan
                ? `${Math.min(todayPagesCount, 2)}/2`
                : todayPagesCount}
            </strong>
          </div>

          <div>
            <small>Disponibles</small>
            <strong>{isFreePlan ? remainingTodayPages : "Según plan"}</strong>
          </div>

          <div>
            <small>Total</small>
            <strong>{pages.length}</strong>
          </div>
        </div>

        {isFreePlan && remainingTodayPages === 0 && (
          <div className="mobile-limit-warning">
            ⚠ Ya alcanzaste tu límite gratuito de hoy.
            <Link to="/plans">Comprar plan</Link>
          </div>
        )}
      </div>

      <div className="mobile-panel-tabs">
        <button
          type="button"
          className={tab === "pages" ? "active" : ""}
          onClick={() => setTab("pages")}
        >
          Páginas <span>{pages.length}</span>
        </button>

        <button
          type="button"
          className={tab === "plans" ? "active" : ""}
          onClick={() => setTab("plans")}
        >
          Plan
        </button>

        <button
          type="button"
          className={tab === "payments" ? "active" : ""}
          onClick={() => setTab("payments")}
        >
          Pagos <span>{payments.length}</span>
        </button>
      </div>

      {tab === "pages" && (
        <>
          {loading ? (
            <div className="mobile-empty">Cargando páginas...</div>
          ) : pages.length === 0 ? (
            <div className="mobile-empty">
              <h3>Aún no tienes páginas</h3>
              <p>Crea tu primera página personalizada en minutos.</p>
              <Link to="/templates" className="mobile-empty-action">
                + Crear mi primera página
              </Link>
            </div>
          ) : (
            <div className="mobile-template-groups">
              {groupedPages.map((group) => {
                const isOpen = openTemplateId === group.templateId;

                return (
                  <article
                    className="mobile-template-group"
                    key={group.templateId}
                  >
                    <button
                      type="button"
                      className="mobile-template-group-head"
                      onClick={() => toggleTemplate(group.templateId)}
                    >
                      <div>
                        <h3>💌 {group.templateTitle}</h3>
                        <p>{group.pages.length} de 5 páginas creadas</p>
                      </div>

                      <span>{isOpen ? "⌃" : "⌄"}</span>
                    </button>

                    {isOpen && (
                      <div className="mobile-template-pages">
                        {group.pages.map((page) => (
                          <div
                            className="mobile-template-page-row"
                            key={page.id}
                          >
                            <div>
                              <h4>{page.title || "Mi página especial"}</h4>
                              <p>
                                {page.is_published ? "Publicado" : "Borrador"} ·{" "}
                                {formatDate(page.created_at)}
                              </p>
                            </div>

                            <div className="mobile-template-page-actions">
                              <Link to={`/editor/${page.id}`}>Editar</Link>

                              {page.slug && (
                                <Link to={`/p/${page.slug}`}>Ver</Link>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "plans" && (
        <div className="mobile-plan-summary">
          <span className="mobile-plan-badge">Plan actual</span>

          <h2>
            {activePlanIcon} {activePlanName}
          </h2>

          <p>
            {isFreePlan
              ? "Actualmente estás usando el acceso gratis."
              : `Tu plan ${activePlanName} está activo y listo para usar.`}
          </p>

          <div className="mobile-plan-stats">
            <div>
              <small>Estado</small>
              <strong>Activo</strong>
            </div>

            <div>
              <small>Monedas</small>
              <strong>{currentUser?.coins ?? 0} 🪙</strong>
            </div>

            <div>
              <small>Páginas</small>
              <strong>{pages.length}</strong>
            </div>
          </div>

          <div className="mobile-plan-actions">
            <Link to="/plans">Ver planes</Link>
            <Link to="/templates">Crear página</Link>
          </div>
        </div>
      )}

      {tab === "payments" && (
        <>
          {paymentsLoading ? (
            <div className="mobile-empty">Cargando pagos...</div>
          ) : payments.length === 0 ? (
            <div className="mobile-empty">
              <h3>No tienes pagos registrados</h3>
              <p>Tus pagos aparecerán aquí.</p>
            </div>
          ) : (
            <div className="mobile-payments-list">
              {payments.map((payment) => (
                <article className="mobile-payment-card" key={payment.id}>
                  <div>
                    <h3>
                      {payment.plan_name || payment.type || "Pago de monedas"}
                    </h3>
                    <p>Operación: {payment.operation_number || "Sin número"}</p>
                    <small>{formatDate(payment.created_at)}</small>
                  </div>

                  <div>
                    <strong>{payment.coins || 0} 🪙</strong>
                    <span className={`mobile-payment-status ${payment.status}`}>
                      {statusLabels[payment.status] || payment.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
