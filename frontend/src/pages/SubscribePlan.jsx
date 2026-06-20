import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function getPlanIcon(plan) {
  if (plan.access_level === "free") return "✨";
  if (plan.access_level === "premium") return "👑";
  if (plan.access_level === "vip") return "💎";
  if (plan.access_level === "exclusive") return "🚀";
  return "💎";
}

function getPlanTitle(plan) {
  if (plan.access_level === "free") return "Standard";
  if (plan.access_level === "premium") return "Premium";
  if (plan.access_level === "vip") return "VIP";
  if (plan.access_level === "exclusive") return "Super User";
  return plan.name;
}

export default function SubscribePlan() {
  const navigate = useNavigate();
  const { planId } = useParams();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPlan() {
      try {
        const response = await fetch(`${API_URL}/api/plans`, {
          headers: {
            Accept: "application/json",
          },
        });

        const data = await response.json();

        const found = Array.isArray(data)
          ? data.find((plan) => plan.slug === planId && plan.is_active)
          : null;

        setSelectedPlan(found || null);
      } catch (error) {
        console.error(error);
        setSelectedPlan(null);
      } finally {
        setPageLoading(false);
      }
    }

    loadPlan();
  }, [planId]);

  const handleConfirm = async () => {
    setLoading(true);
    setMessage("");

    const token =
      localStorage.getItem("apiToken") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("access_token");

    if (!token) {
      setMessage("Tu sesión expiró. Inicia sesión nuevamente.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/subscriptions/activate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan_slug: selectedPlan.slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "No se pudo activar el plan.");

        if (data.redirect_to === "/wallet") {
          setTimeout(() => {
            navigate("/wallet");
          }, 1800);
        }

        return;
      }

      const updatedUser = {
        ...(data.user || JSON.parse(localStorage.getItem("user") || "{}")),
        coins: data.coins_left,
        active_plan: data.active_plan || selectedPlan.access_level,
        plan_slug: data.plan_slug || selectedPlan.slug,
        active_subscription: data.subscription,
        subscription: data.subscription,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("user_coins", String(data.coins_left));

      window.dispatchEvent(new Event("storage"));

      setMessage(data.message || "Plan activado correctamente.");

      setTimeout(() => {
        navigate("/plans");
      }, 1200);
    } catch (error) {
      console.error(error);
      setMessage("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-card subscribe-page">
          <h1>Cargando plan...</h1>
        </section>
      </main>
    );
  }

  if (!selectedPlan) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-card subscribe-page">
          <h1>Plan no encontrado</h1>

          <button
            type="button"
            className="back-login-btn"
            onClick={() => navigate("/plans")}
          >
            ← Volver a planes
          </button>
        </section>
      </main>
    );
  }

  const price = Number(selectedPlan.price_amount || 0);
  const features = Array.isArray(selectedPlan.features)
    ? selectedPlan.features
    : [];
  const title = getPlanTitle(selectedPlan);

  return (
    <main className="dashboard-page">
      <section className="subscribe-premium-box">
        <div className="subscribe-badge">SUSCRIPCIÓN</div>

        <h1 className="subscribe-title">
          Suscripción <span>{title}</span>
        </h1>

        <p className="subscribe-description">
          Activa este plan y desbloquea sus beneficios.
        </p>

        <div className="premium-card">
          <div className="premium-icon">{getPlanIcon(selectedPlan)}</div>

          <h2>Plan {title}</h2>

          <div className="premium-price">
            <span className="coin-inline">🪙</span>
            <strong>{price}</strong>
          </div>

          <p>monedas de oro</p>

          <div className="premium-divider"></div>

          <h3>Incluye todo esto:</h3>

          <ul className="premium-features">
            {features.map((feature, index) => (
              <li key={index}>✓ {feature}</li>
            ))}
          </ul>
        </div>

        {message && <p className="subscribe-message">{message}</p>}

        <button
          type="button"
          className="confirm-premium-btn"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading
            ? "Activando..."
            : price > 0
              ? `🪙 Confirmar con ${price} monedas`
              : "Confirmar plan gratis"}
        </button>

        <p className="secure-text">🔒 Transacción segura y protegida</p>
      </section>
    </main>
  );
}
