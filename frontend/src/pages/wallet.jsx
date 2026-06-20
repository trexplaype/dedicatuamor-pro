import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SubscriptionPlans from "../components/SubscriptionPlans";
import { getMyPayments } from "../services/paymentService";
import { getUser } from "../services/userService";

const normalCoins = [
  { coins: 100, price: "S/ 5" },
  { coins: 150, price: "S/ 10" },
  { coins: 300, price: "S/ 20" },
  { coins: 600, price: "S/ 35" },
];

const firstPurchaseCoins = [
  { coins: 100, bonus: 20, price: "S/ 5" },
  { coins: 150, bonus: 50, price: "S/ 10" },
  { coins: 300, bonus: 70, price: "S/ 20" },
  { coins: 600, bonus: 150, price: "S/ 35" },
];

export default function Wallet() {
  const navigate = useNavigate();

  const [openRecharge, setOpenRecharge] = useState(true);
  const [userCoins, setUserCoins] = useState(0);
  const [firstPurchaseCompleted, setFirstPurchaseCompleted] = useState(false);
  const [payments, setPayments] = useState([]);

  const loadUser = async () => {
    try {
      const user = await getUser();
      setUserCoins(user?.coins || 0);
      setFirstPurchaseCompleted(user?.first_purchase_completed || false);
    } catch (error) {
      console.error("Error cargando usuario:", error);
    }
  };

  const loadPayments = async () => {
    try {
      const data = await getMyPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando pagos:", error);
    }
  };

  const goToCheckout = (pack) => {
    navigate("/checkout", {
      state: { pack },
    });
  };

  const goToRewards = () => {
    window.location.assign("/rewards");
  };

  useEffect(() => {
    loadUser();
    loadPayments();
  }, []);

  return (
    <main className="dashboard-page">
      <section className="dashboard-card wallet-page">
        <div className="wallet-top">
          <div>
            <p className="wallet-mini">TU BALANCE</p>
            <h1>🪙 Mi billetera</h1>
          </div>

          <div className="wallet-coins">🪙 {userCoins} monedas</div>
        </div>

        <div className="wallet-balance">
          <span>Saldo disponible</span>
          <strong>{userCoins}</strong>
          <p>
            Monedas disponibles para usar en dedicatorias, plantillas y planes.
          </p>
        </div>

        <div className="wallet-actions">
          <button
            type="button"
            className="wallet-btn-primary"
            onClick={() => setOpenRecharge((value) => !value)}
          >
            🪙 Comprar monedas
          </button>

          <button
            type="button"
            className="wallet-btn-secondary"
            onClick={goToRewards}
          >
            🏆 Ganar monedas
          </button>
        </div>

        {openRecharge && (
          <div className="recharge-panel">
            <h2>Tienda de monedas</h2>

            <p className="wallet-section-title">Compra normal</p>

            <div className="coins-grid coins-grid-4">
              {normalCoins.map((pack) => (
                <button
                  key={pack.coins}
                  type="button"
                  className="coin-card"
                  onClick={() => goToCheckout(pack)}
                >
                  <span className="coin-icon">🪙</span>
                  <strong>{pack.coins} monedas</strong>
                  <span className="coin-price">{pack.price}</span>
                  <span className="coin-buy">Comprar</span>
                </button>
              ))}
            </div>

            {!firstPurchaseCompleted && (
              <>
                <p className="wallet-section-title">🎁 Bonus primera compra</p>

                <div className="coins-grid coins-grid-4">
                  {firstPurchaseCoins.map((pack) => (
                    <button
                      key={`${pack.coins}-${pack.bonus}`}
                      type="button"
                      className="coin-card popular"
                      onClick={() => goToCheckout(pack)}
                    >
                      <span className="coin-badge">BONUS</span>
                      <span className="coin-icon">🪙</span>
                      <strong>
                        {pack.coins} monedas + {pack.bonus}
                      </strong>
                      <span className="coin-price">{pack.price}</span>
                      <span className="coin-buy">Comprar</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <section className="wallet-history">
          <div className="section-heading centered">
            <p className="eyebrow">Historial</p>
            <h2>Mis recargas</h2>
            <p>
              Revisa tus pedidos de recarga: pendiente, aprobado o rechazado.
            </p>
          </div>

          <div className="wallet-history-list">
            {payments.length === 0 ? (
              <div className="wallet-history-empty">
                Aún no tienes recargas registradas.
              </div>
            ) : (
              payments.map((payment) => (
                <article
                  key={payment.id}
                  className={`wallet-history-card ${payment.status}`}
                >
                  <div className="wallet-history-top">
                    <strong>{payment.coins} monedas</strong>

                    <span>
                      {payment.status === "pending" && "Pendiente"}
                      {payment.status === "approved" && "Aprobado"}
                      {payment.status === "paid" && "Aprobado"}
                      {payment.status === "rejected" && "Rechazado"}
                    </span>
                  </div>

                  <p>
                    Monto: <strong>S/ {payment.amount}</strong>
                  </p>

                  <p>
                    Operación Yape:{" "}
                    <strong>{payment.operation_number || "Sin número"}</strong>
                  </p>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="wallet-plans-section">
          <div className="section-heading centered">
            <p className="eyebrow">Suscripciones</p>
            <h2>Planes Premium</h2>
            <p>Compra monedas de oro y úsalas para suscribirte a un plan.</p>
          </div>

          <SubscriptionPlans />
        </section>
      </section>
    </main>
  );
}
