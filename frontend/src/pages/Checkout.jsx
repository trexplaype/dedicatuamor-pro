import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { createManualCoinsPayment } from "../services/paymentService";
import { useAuth } from "../hooks/useAuth";

export default function Checkout() {
  const navigate = useNavigate();

  const location = useLocation();

  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  const pack = location.state?.pack;

  if (!pack) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-card">
          <h1>Checkout</h1>

          <p>No seleccionaste ningún paquete de monedas.</p>

          <button
            type="button"
            className="button button-primary"
            onClick={() => navigate("/wallet")}
          >
            Volver a mi billetera
          </button>
        </section>
      </main>
    );
  }

  const totalCoins = pack.coins + (pack.bonus || 0);

  const amount = Number(pack.price.replace("S/", "").trim());

  const handleRequestRecharge = async () => {
    try {
      setLoading(true);

      const data = await createManualCoinsPayment({
        amount,
        coins: totalCoins,
        operation_number: null,
      });

      console.log("DATA COMPLETA:", data);

      const paymentData = data?.payment || data;

      const rechargeId = paymentData?.id;

      if (!rechargeId) {
        alert("No se recibió el ID de recarga desde Laravel.");

        return;
      }

      const message = encodeURIComponent(
        `Hola, solicito validar mi recarga.

ID de recarga: #${rechargeId}
ID de usuario: #${user?.id}
Nombre: ${user?.name}
Correo: ${user?.email}
Monedas solicitadas: ${totalCoins}
Monto pagado: ${pack.price}

Adjunto mi comprobante de pago.`,
      );

      window.open(`https://wa.me/51934992449?text=${message}`, "_blank");

      alert(
        "Recarga solicitada correctamente. Adjunta tu comprobante en WhatsApp.",
      );

      navigate("/wallet");
    } catch (error) {
      console.error("ERROR:", error);

      console.error("ERROR COMPLETO:", error);

      alert(JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-card checkout-page">
        <div className="section-heading centered">
          <p className="eyebrow">Checkout</p>

          <h1>Finalizar recarga</h1>

          <p>
            Realiza el pago por Yape y solicita tu recarga. Luego adjunta el
            comprobante por WhatsApp.
          </p>
        </div>

        <div className="checkout-summary">
          <div>
            <span>ID de usuario</span>

            <strong>#{user?.id}</strong>
          </div>

          <div>
            <span>Monedas</span>

            <strong>{totalCoins}</strong>
          </div>

          <div>
            <span>Total a pagar</span>

            <strong>{pack.price}</strong>
          </div>
        </div>

        <div className="payment-panel">
          <div className="payment-panel-header">
            <div>
              <p className="payment-mini">MÉTODO DE PAGO</p>

              <h3>📲 Pago por Yape</h3>
            </div>
          </div>

          <div className="payment-qr-box">
            <img src="/yape-qr.png" alt="QR Yape" className="yape-qr" />

            <div className="payment-yape-info">
              <p>Número Yape</p>

              <strong>934 992 449</strong>

              <p>
                Después de pagar, presiona
                <strong> “Solicitar mi recarga”</strong>.
              </p>

              <p>
                Se abrirá WhatsApp con tu ID de usuario y el ID de recarga. Solo
                adjunta tu comprobante de pago.
              </p>
            </div>
          </div>

          <div className="payment-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={handleRequestRecharge}
              disabled={loading}
            >
              {loading ? "Solicitando..." : "Solicitar mi recarga"}
            </button>

            <button
              type="button"
              className="button button-secondary"
              onClick={() => navigate("/wallet")}
            >
              Cancelar
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
