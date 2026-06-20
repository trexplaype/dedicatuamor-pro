import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const coinPackages = [
  {
    id: "coins_100",
    coins: 100,
    amount: 5,
    label: "Básico",
  },
  {
    id: "coins_300",
    coins: 300,
    amount: 12,
    label: "Popular",
  },
  {
    id: "coins_700",
    coins: 700,
    amount: 25,
    label: "Premium",
  },
  {
    id: "coins_1500",
    coins: 1500,
    amount: 50,
    label: "VIP",
  },
];

export default function MobileWallet() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBuy = (pack) => {
    navigate("/checkout", {
      state: {
        package: pack,
        coins: pack.coins,
        amount: pack.amount,
      },
    });
  };

  return (
    <div className="mobile-page">
      <div className="mobile-page-header">
        <h1>🪙 Mi billetera</h1>
        <p>Recarga monedas para crear más dedicatorias.</p>
      </div>

      <div className="mobile-wallet-balance">
        <span>Saldo actual</span>
        <strong>{user?.coins || 0} 🪙</strong>
      </div>

      <div className="mobile-wallet-grid">
        {coinPackages.map((pack) => (
          <button
            key={pack.id}
            type="button"
            className="mobile-wallet-pack"
            onClick={() => handleBuy(pack)}
          >
            <span>{pack.label}</span>
            <strong>{pack.coins} 🪙</strong>
            <small>S/ {pack.amount}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
