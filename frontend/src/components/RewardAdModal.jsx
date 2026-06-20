import { useEffect, useState } from "react";
import { claimRewardAd, cancelRewardAd } from "../services/rewardAdService";

export default function RewardAdModal({ adSession, onClose, onClaimed }) {
  const [secondsLeft, setSecondsLeft] = useState(adSession.duration_seconds);
  const [canClaim, setCanClaim] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!adSession) return;

    if (secondsLeft <= 0) {
      setCanClaim(true);
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((value) => value - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, adSession]);

  const handleClose = async () => {
    if (!canClaim) {
      await cancelRewardAd(adSession.session_id);
    }

    onClose();
  };

  const handleClaim = async () => {
    try {
      setLoading(true);

      const data = await claimRewardAd(adSession.session_id);

      alert(
        `🎉 ${data.message}\nSaldo actual: ${data.total_coins} 🪙\nPuedes ver otro anuncio para seguir ganando.`,
      );

      onClaimed(data);
      onClose();
    } catch (error) {
      alert(error.message || "Error al reclamar monedas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reward-modal-backdrop">
      <div className="reward-modal">
        <button
          type="button"
          className="reward-modal-close"
          onClick={handleClose}
        >
          ×
        </button>

        <h2>🎬 Anuncio en reproducción</h2>

        <p>
          No cierres esta ventana. La recompensa estará disponible al terminar
          el anuncio.
        </p>

        <div className="reward-ad-box">
          <span>PUBLICIDAD</span>
          <strong>{secondsLeft}s</strong>
        </div>

        {!canClaim ? (
          <button type="button" disabled className="reward-claim-disabled">
            Espera {secondsLeft}s para reclamar
          </button>
        ) : (
          <button
            type="button"
            className="reward-claim-btn"
            onClick={handleClaim}
            disabled={loading}
          >
            {loading ? "Reclamando..." : `Reclamar ${adSession.coins} 🪙`}
          </button>
        )}
      </div>
    </div>
  );
}
