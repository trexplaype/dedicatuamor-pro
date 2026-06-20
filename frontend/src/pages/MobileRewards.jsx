import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { IoPlayCircle } from "react-icons/io5";

import { getUser } from "../services/userService";
import {
  addRewardTaskProgress,
  getRewardTasks,
} from "../services/rewardTaskService";

import "../styles/mobile-app.css";

export default function MobileRewards() {
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

  const getButtonText = (task) => {
    if (task.completed) return "Listo";
    if (task.type === "whatsapp_invite") return "Invitar";
    return "Mirar";
  };

  const getTaskText = (task) => {
    if (task.type === "whatsapp_invite") {
      return `Invita ${task.target_count} amigos diarios`;
    }

    return `Mira ${task.target_count} anuncios`;
  };

  const handleTask = async (task) => {
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
      <div className="mobile-page compact-rewards">
        <h2 className="compact-title">Cargando recompensas...</h2>
      </div>
    );
  }

  return (
    <div className="mobile-page compact-rewards">
      <h2 className="compact-title">Gana Recompensas</h2>

      <div className="mobile-wallet-card compact-wallet">
        <span>🪙</span>
        <div>
          <strong>{userCoins}</strong>
          <p>monedas disponibles</p>
        </div>
      </div>

      <div className="compact-reward-list">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`compact-reward-item ${
              task.completed ? "completed" : ""
            }`}
          >
            <div className="compact-reward-left">
              <div className="compact-reward-icon">{getIcon(task.type)}</div>

              <div>
                <h3>{getTaskText(task)}</h3>
                <p>
                  {task.progress_count}/{task.target_count} · +
                  {task.reward_coins} 🪙
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={task.completed}
              onClick={() => handleTask(task)}
            >
              {getButtonText(task)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
