import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API_URL from "../services/api";

function getPlanTitle(plan) {
  if (plan.access_level === "free") return "Standard";
  if (plan.access_level === "premium") return "Premium";
  if (plan.access_level === "vip") return "VIP";
  if (plan.access_level === "exclusive") return "Super User";

  return plan.name;
}

function getPlanBadge(plan, isCurrentPlan) {
  if (isCurrentPlan) return "PLAN ACTUAL";
  if (plan.access_level === "premium") return "Más elegido";
  if (plan.access_level === "vip") return "VIP";
  if (plan.access_level === "exclusive") return "EXCLUSIVE";

  return "Gratis";
}

function getDurationLabel(plan) {
  const months = Number(plan.duration_months || 0);

  if (!months || plan.access_level === "free") return "";

  return months === 1 ? "1 MES" : `${months} MESES`;
}

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

export default function SubscriptionPlans() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("apiToken") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("access_token");

  const isLoggedIn = Boolean(token && user?.id);

  const activePlan = isLoggedIn
    ? user?.active_subscription?.plan_slug ||
      user?.subscription?.plan_slug ||
      user?.plan_slug ||
      user?.active_plan ||
      "free"
    : null;

  useEffect(() => {
    async function loadData() {
      try {
        const plansResponse = await fetch(`${API_URL}/api/plans`, {
          headers: {
            Accept: "application/json",
          },
        });

        const plansData = await plansResponse.json();

        setPlans(
          Array.isArray(plansData)
            ? plansData.filter((plan) => plan.is_active)
            : [],
        );

        if (token) {
          const userResponse = await fetch(`${API_URL}/api/user`, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const freshUser = await userResponse.json().catch(() => null);

          if (userResponse.ok && freshUser) {
            localStorage.setItem("user", JSON.stringify(freshUser));
            setUser(freshUser);
          }
        }
      } catch (error) {
        console.error(error);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [token]);

  const handlePlanClick = (plan) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (activePlan === plan.access_level || activePlan === plan.slug) {
      return;
    }

    navigate(`/subscribe-plan/${plan.slug}`);
  };

  if (loading) {
    return <p className="plans-loading">Cargando planes...</p>;
  }

  return (
    <div className="plans-grid">
      {plans.map((plan) => {
        const isCurrentPlan =
          isLoggedIn &&
          (activePlan === plan.access_level || activePlan === plan.slug);

        const title = getPlanTitle(plan);
        const price = Number(plan.price_amount || 0);
        const features = Array.isArray(plan.features) ? plan.features : [];
        const durationLabel = getDurationLabel(plan);

        return (
          <article
            key={plan.id}
            className={`plan ${
              plan.access_level === "premium" ? "highlighted" : ""
            } ${isCurrentPlan ? "active-plan-card" : ""}`}
          >
            <div className="plan-badge">
              {getPlanBadge(plan, isCurrentPlan)}
            </div>

            {durationLabel && (
              <div className="plan-duration-badge">{durationLabel}</div>
            )}

            <h3>{title}</h3>

            <div className="plan-price-clean">
              {price > 0 ? (
                <>
                  <span className="plan-coin-icon">🪙</span>
                  <strong>{price}</strong>
                  <span className="price-label">monedas</span>
                </>
              ) : (
                <>
                  <strong className="free-price">Gratis</strong>
                  <span className="price-label">para empezar</span>
                </>
              )}
            </div>

            <ul className="plan-features">
              {features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>

            {isCurrentPlan ? (
              <button type="button" className="button plan-button" disabled>
                ✓ Actualmente suscrito
              </button>
            ) : (
              <button
                type="button"
                className="button button-primary plan-button"
                onClick={() => handlePlanClick(plan)}
              >
                {!isLoggedIn
                  ? "Iniciar sesión para activar"
                  : price > 0
                    ? `Activar por ${price} 🪙`
                    : "Empezar gratis"}
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}
