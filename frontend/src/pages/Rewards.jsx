import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { IoPlayCircle } from "react-icons/io5";

import "../styles/rewards.css";

import { getUser } from "../services/userService";
import {
  addRewardTaskProgress,
  getRewardTasks,
} from "../services/rewardTaskService";

export default function Rewards() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("all");
  const [tasks, setTasks] = useState([]);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [user, rewardTasks] = await Promise.all([
        getUser(),
        getRewardTasks(),
      ]);

      setUserCoins(user?.coins || 0);
      setTasks(Array.isArray(rewardTasks) ? rewardTasks : []);
    } catch (error) {
      alert(error.message || "Error cargando recompensas");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    if (type === "whatsapp_invite") return <FaWhatsapp />;
    return <IoPlayCircle />;
  };

  const getCategory = (type) => {
    if (type === "whatsapp_invite") return "social";
    return "videos";
  };

  const getBadge = (task) => {
    if (task.completed) return "COMPLETADO";
    if (task.type === "whatsapp_invite") return "DIARIO";
    return "ANUNCIOS";
  };

  const getClassName = (task) => {
    if (task.completed) return "purple-card";
    if (task.type === "whatsapp_invite") return "green-card";
    return "pink-card";
  };

  const getTaskTitle = (task) => {
    if (task.type === "whatsapp_invite") {
      return `Invitar ${task.target_count} amigos diarios`;
    }

    return `Mirar ${task.target_count} anuncios`;
  };

  const getTaskText = (task) => {
    if (task.completed) {
      return "Ya completaste esta recompensa por hoy.";
    }

    if (task.type === "whatsapp_invite") {
      return `Comparte por WhatsApp e invita ${task.target_count} amigos para reclamar monedas.`;
    }

    return `Mira ${task.target_count} anuncios completos para reclamar esta recompensa.`;
  };

  const getButtonText = (task) => {
    if (task.completed) return "Completado";
    if (task.type === "whatsapp_invite") return "Invitar por WhatsApp";
    return "Ver anuncio";
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "videos") return getCategory(task.type) === "videos";
    if (filter === "social") return getCategory(task.type) === "social";
    if (filter === "popular") return true;

    return true;
  });

  const handleReward = async (task) => {
    if (task.completed) {
      alert("Ya completaste esta recompensa hoy.");
      return;
    }

    if (task.type === "whatsapp_invite") {
      const message = `🎁 Te invito a usar DEV AGS.

Crea páginas de amor, dedicatorias y plantillas bonitas para compartir.

Entra aquí:
https://app.ebookpackstore.com`;

      window.open(
        `https://wa.me/?text=${encodeURIComponent(message)}`,
        "_blank",
      );
    }

    try {
      const data = await addRewardTaskProgress(task.id);

      if (data.completed) {
        alert(`🎉 Ganaste +${data.reward_coins} monedas`);
      } else {
        alert(`Progreso: ${data.progress_count}/${data.target_count}`);
      }

      await loadData();
    } catch (error) {
      alert(error.message || "Error actualizando recompensa");
    }
  };

  if (loading) {
    return (
      <main className="rewards-layout">
        <section className="rewards-main">
          <header className="rewards-hero">
            <div>
              <h1>🎁 Cargando recompensas...</h1>
              <p>Estamos preparando las monedas gratis disponibles.</p>
            </div>

            <div className="hero-coin">
              <span>⭐</span>
              <strong>🪙</strong>
              <span>⭐</span>
            </div>
          </header>
        </section>
      </main>
    );
  }

  return (
    <main className="rewards-layout">
      <aside className="rewards-sidebar">
        <div className="rewards-wallet-box">
          <h3>MI BILLETERA</h3>

          <div className="rewards-balance">
            <span className="coin-big">🪙</span>

            <div>
              <strong>{userCoins}</strong>
              <p>monedas</p>
            </div>
          </div>
        </div>

        <nav className="rewards-menu">
          <button type="button" onClick={() => navigate("/wallet")}>
            🎛️ Resumen
          </button>

          <button type="button" onClick={() => navigate("/wallet")}>
            🪙 Comprar Monedas
          </button>

          <button type="button" className="active">
            🎁 Ganar Monedas
          </button>
        </nav>

        <div className="rewards-promo">
          <h3>¡Multiplica tus monedas!</h3>
          <p>Completa tareas diarias y gana monedas gratis.</p>
          <div className="promo-coins">🪙🪙🪙</div>
        </div>
      </aside>

      <section className="rewards-main">
        <header className="rewards-hero">
          <div>
            <h1>🎁 Ganar Monedas Gratis</h1>
            <p>Completa tareas diarias para desbloquear plantillas premium.</p>
          </div>

          <div className="hero-coin">
            <span>⭐</span>
            <strong>🪙</strong>
            <span>⭐</span>
          </div>
        </header>

        <div className="rewards-tabs">
          <button
            type="button"
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            Todas
          </button>

          <button
            type="button"
            className={filter === "popular" ? "active" : ""}
            onClick={() => setFilter("popular")}
          >
            ⭐ Más Populares
          </button>

          <button
            type="button"
            className={filter === "videos" ? "active" : ""}
            onClick={() => setFilter("videos")}
          >
            ▶️ Videos
          </button>

          <button
            type="button"
            className={filter === "social" ? "active" : ""}
            onClick={() => setFilter("social")}
          >
            <FaWhatsapp /> WhatsApp
          </button>
        </div>

        <div className="rewards-grid">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`reward-card ${getClassName(task)} ${
                task.completed ? "reward-completed" : ""
              }`}
            >
              <small>{getBadge(task)}</small>

              <div className="reward-icon liquid-icon">
                {getIcon(task.type)}
              </div>

              <h3>{getTaskTitle(task)}</h3>

              <p>{getTaskText(task)}</p>

              <strong>
                {task.progress_count}/{task.target_count} · +{task.reward_coins}{" "}
                🪙
              </strong>

              <button
                type="button"
                disabled={task.completed}
                onClick={() => handleReward(task)}
              >
                {getButtonText(task)}
              </button>
            </div>
          ))}
        </div>

        <div className="rewards-bottom-card">
          <div className="bottom-coins">🪙</div>

          <div>
            <h3>¡Hay muchas formas de ganar!</h3>
            <p>
              Mira anuncios o invita amigos por WhatsApp cada día para ganar
              monedas gratis.
            </p>
          </div>

          <div className="bottom-soon">
            <span>⚡</span>

            <div>
              <h3>Recompensas activas</h3>
              <p>Todo se administra desde tu panel de admin.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
