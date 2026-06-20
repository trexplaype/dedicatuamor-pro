import SubscriptionPlans from "../components/SubscriptionPlans";

export default function Plans() {
  return (
    <main className="dashboard-page">
      <section className="subscribe-premium-box">
        <div className="subscribe-badge">Suscripciones</div>

        <h1 className="subscribe-title">
          Planes <span>Suscripción</span>
        </h1>

        <p className="subscribe-description">
          Compra monedas de oro y úsalas para desbloquear planes premium.
        </p>

        <SubscriptionPlans />
      </section>
    </main>
  );
}
