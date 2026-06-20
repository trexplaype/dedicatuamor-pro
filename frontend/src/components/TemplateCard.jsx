import { useState } from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import API_URL from "../services/api";
import { createUserPage } from "../services/userPageService";
import { purchaseTemplate } from "../services/templateService";

function buildUrl(path) {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_URL}${path}`;
}

function normalizePlan(plan) {
  if (!plan) return "free";
  if (plan === "standard") return "free";
  if (plan === "super_user") return "super-user";
  if (plan === "exclusive") return "super-user";
  return plan;
}

function getPlanLabel(plan) {
  const labels = {
    free: "FREE",
    premium: "PREMIUM",
    vip: "VIP",
    "super-user": "SUPER USER",
    "admin-only": "ADMIN",
  };

  return labels[normalizePlan(plan)] || "FREE";
}

function getPlanClass(plan) {
  return `template-plan-${normalizePlan(plan)}`;
}

function getPlanRank(plan) {
  const ranks = {
    free: 1,
    premium: 2,
    vip: 3,
    "super-user": 4,
    admin: 999,
    "admin-only": 999,
  };

  return ranks[normalizePlan(plan)] || 1;
}

export default function TemplateCard({
  template,
  purchasedTemplates = [],
  userPages = [],
  onStatusChange,
}) {
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);
  const [message, setMessage] = useState(null);
  const closeMessage = () => {
    setMessage(null);
  };

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token =
    localStorage.getItem("token") || localStorage.getItem("apiToken");

  const isLoggedIn = Boolean(token);

  const title = template.title || template.name || "Plantilla";
  const description =
    template.description || "Crea una dedicatoria digital personalizada.";

  const previewUrl = buildUrl(
    template.preview_url || template.previewUrl || template.preview,
  );

  const editorUrl = buildUrl(
    template.editor_url || template.editorUrl || template.editor,
  );

  const viewUrl = buildUrl(
    template.view_url ||
      template.viewUrl ||
      template.index_url ||
      template.indexUrl,
  );

  const previewImage = buildUrl(
    template.preview_image || template.previewImage || template.image,
  );

  const requiredPlan = normalizePlan(template.required_plan || "free");
  const requiredLabel = getPlanLabel(requiredPlan);

  const userRole = user?.role || "user";
  const isAdmin = userRole === "admin";

  const activePlan = normalizePlan(
    user?.active_subscription?.access_level ||
      user?.subscription?.access_level ||
      user?.active_plan ||
      user?.plan_slug ||
      template.user_access_level ||
      "free",
  );

  const hasActiveSubscription =
    isAdmin || (activePlan !== "free" && activePlan !== "standard");

  const isPurchased =
    Boolean(template.is_purchased) ||
    purchasedTemplates.some((item) => {
      const id = item.id || item.template_id || item.template?.id;
      return Number(id) === Number(template.id);
    });

  const isIndividualPurchase = Boolean(template.is_individual_purchase);

  const userCoins = Number(user?.coins || 0);
  const individualPrice = Number(
    template.individual_price_coins || template.price_coins || 0,
  );

  const freeLimit = Number(template.free_initial_page_limit || 2);
  const totalPages = userPages.length;

  const isFreeUser = !hasActiveSubscription && !isAdmin;
  const freeLimitReached = isFreeUser && totalPages >= freeLimit;

  const canAccessByPlan =
    isAdmin ||
    Boolean(template.can_access_by_plan) ||
    getPlanRank(activePlan) >= getPlanRank(requiredPlan);

  const canUseFreeTrial =
    isFreeUser &&
    !isPurchased &&
    Boolean(template.allow_free_initial_use) &&
    (requiredPlan === "free" || requiredPlan === "premium") &&
    !freeLimitReached;

  const canCreate =
    Boolean(template.can_create_page) ||
    isAdmin ||
    isPurchased ||
    (hasActiveSubscription && canAccessByPlan) ||
    canUseFreeTrial;

  const canPurchase =
    !isAdmin &&
    !hasActiveSubscription &&
    !isPurchased &&
    Boolean(template.allow_individual_purchase || template.can_purchase) &&
    individualPrice > 0;

  const showBuyButton = !canCreate && canPurchase;
  const showSubscribeButton = !canCreate;

  const pageCount = userPages.filter((page) => {
    const id = page.template_id || page.template?.id;
    return Number(id) === Number(template.id);
  }).length;

  const status = (() => {
    if (isAdmin) {
      return {
        icon: "👑",
        className: "status-admin",
        title: "Acceso sin límites",
        text: "Administrador",
      };
    }

    if (isPurchased && isIndividualPurchase) {
      return {
        icon: "✅",
        className: "status-success",
        title: "Plantilla comprada",
        text: "Acceso activo",
      };
    }

    if (hasActiveSubscription && canAccessByPlan) {
      return {
        icon: "👑",
        className: "status-success",
        title: "Incluida en tu Plan",
        text: "Acceso por suscripción",
      };
    }

    if (freeLimitReached) {
      return {
        icon: "🔒",
        className: "status-danger",
        title: "Límite alcanzado",
        text: `Ya usaste tus ${freeLimit} páginas gratis`,
      };
    }

    if (canUseFreeTrial) {
      return {
        icon: "✅",
        className: "status-success",
        title: "Prueba disponible",
        text: `${Math.max(freeLimit - totalPages, 0)} páginas gratis restantes`,
      };
    }

    return {
      icon: "🔒",
      className: "status-warning",
      title: `Requiere plan ${requiredLabel}`,
      text: "Mejora tu plan para acceder",
    };
  })();

  const handleCreatePage = async () => {
    try {
      if (!token) {
        setMessage({
          type: "error",
          title: "Inicia sesión",
          text: "Debes iniciar sesión para crear una página.",
          action: "login",
        });
        return;
      }

      if (!canCreate) {
        setMessage({
          type: "error",
          title: "Plantilla bloqueada",
          text: canPurchase
            ? `Puedes comprar esta plantilla por ${individualPrice}🪙 o suscribirte.`
            : `Esta plantilla requiere plan ${requiredLabel}.`,
          action: "blocked",
        });
        return;
      }

      setLoading(true);

      const data = await createUserPage(
        template.id,
        `Mi página ${pageCount + 1}`,
      );

      await onStatusChange?.();

      if (editorUrl) {
        window.location.href = `/zip-editor?editor=${encodeURIComponent(
          editorUrl,
        )}&page_id=${data.page.id}&template_id=${template.id}`;
        return;
      }

      window.location.href = `/editor/${data.page.id}`;
    } catch (error) {
      setMessage({
        type: "error",
        title: "No se pudo crear",
        text: error.message || "No se pudo crear la página.",
        action: "blocked",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTemplate = async () => {
    try {
      if (!token) {
        setMessage({
          type: "error",
          title: "Inicia sesión",
          text: "Debes iniciar sesión para comprar esta plantilla.",
          action: "login",
        });
        return;
      }

      if (userCoins < individualPrice) {
        setMessage({
          type: "error",
          title: "Monedas insuficientes",
          text: `Necesitas ${individualPrice}🪙. Tienes ${userCoins}🪙.`,
          action: "wallet",
        });
        return;
      }

      setBuying(true);
      await purchaseTemplate(template.id);
      await onStatusChange?.();

      setMessage({
        type: "success",
        title: "¡Compra exitosa!",
        text: "Ahora puedes crear páginas con esta plantilla.",
        action: "success",
      });
    } catch (error) {
      setMessage({
        type: "error",
        title: "No se pudo comprar",
        text: error.message || "No se pudo comprar la plantilla.",
        action: "wallet",
      });
    } finally {
      setBuying(false);
    }
  };

  const handleViewTemplate = () => {
    navigate(`/template-preview/${template.id}`, {
      state: { template },
    });
  };

  const renderPreview = () => {
    if (previewUrl) {
      return (
        <iframe
          src={previewUrl}
          title={title}
          className="template-card-iframe"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
          allow="autoplay; fullscreen"
        />
      );
    }

    if (previewImage) {
      return (
        <img
          src={previewImage}
          alt={title}
          className="template-card-image"
          loading="lazy"
        />
      );
    }

    return <span className="preview-symbol">{template.symbol || "💌"}</span>;
  };

  return (
    <>
      <article
        className={`template-card template-card-access ${getPlanClass(
          requiredPlan,
        )} ${canCreate ? "is-open" : "is-locked"}`}
      >
        <div className="preview template-live-preview">
          <span className={`template-plan-badge ${getPlanClass(requiredPlan)}`}>
            {requiredLabel}
          </span>

          {!canCreate && <span className="template-lock">🔒</span>}

          {renderPreview()}
        </div>

        <div className="card-body template-card-body-new">
          <h3>{title}</h3>
          <p>{description}</p>

          <div className={`template-access-status ${status.className}`}>
            <strong>
              <span>{status.icon}</span> {status.title}
            </strong>
            <small>{status.text}</small>
          </div>

          <div className="card-actions template-card-actions">
            {canCreate && (
              <button
                type="button"
                className="button button-primary"
                onClick={handleCreatePage}
                disabled={loading}
              >
                {loading ? "Creando..." : "Crear página"}
              </button>
            )}

            {showBuyButton && (
              <button
                type="button"
                className="button button-primary template-buy-button"
                onClick={handleBuyTemplate}
                disabled={buying}
              >
                {buying ? "Comprando..." : `Comprar ${individualPrice}🪙`}
              </button>
            )}

            {showSubscribeButton && (
              <button
                type="button"
                className="button button-primary template-plan-button"
                onClick={() => {
                  window.location.href = isLoggedIn ? "/plans" : "/login";
                }}
              >
                👑 {isLoggedIn ? "Suscribirse" : "Iniciar sesión"}
              </button>
            )}

            <button
              type="button"
              className="button button-secondary template-view-button"
              onClick={handleViewTemplate}
            >
              👁 Ver plantilla
            </button>
          </div>
        </div>
      </article>

      {message && (
        <div className="app-modal-overlay">
          <div className={`app-modal ${message.type}`}>
            <div className="app-modal-icon">
              {message.type === "success" ? "✓" : "!"}
            </div>

            <h3>{message.title}</h3>
            <p>{message.text}</p>

            {["blocked", "wallet"].includes(message.action) && (
              <>
                <p className="app-modal-balance">
                  Saldo disponible: 🪙 {userCoins}
                </p>

                <div className="app-modal-actions">
                  {canPurchase && (
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={handleBuyTemplate}
                      disabled={buying}
                    >
                      {buying ? "Comprando..." : `Comprar ${individualPrice}🪙`}
                    </button>
                  )}

                  <Button to="/plans" variant="secondary">
                    👑 Suscribirme
                  </Button>

                  <Button to="/wallet" variant="secondary">
                    💰 Recargar
                  </Button>

                  <Button to="/rewards" variant="secondary">
                    🎁 Ganar monedas
                  </Button>
                </div>
              </>
            )}

            {message.action === "login" && (
              <div className="app-modal-actions">
                <Button to="/login" className="button-primary">
                  Iniciar sesión o registrarse
                </Button>
              </div>
            )}

            <button
              type="button"
              className="app-modal-close"
              onClick={closeMessage}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
