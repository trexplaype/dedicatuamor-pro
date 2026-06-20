import { useEffect, useState } from "react";
import {
  createAdminRewardTask,
  deleteAdminRewardTask,
  getAdminRewardTasks,
  updateAdminRewardTask,
} from "../../services/admin/adminRewardService";

import "../../styles/admin.css";

const emptyForm = {
  title: "Mirar anuncios",
  type: "ads",
  target_count: 3,
  reward_coins: 10,
  duration_seconds: 30,
  is_daily: true,
  is_active: true,
  sort_order: 0,
};

export default function AdminRewards() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);

      const data = await getAdminRewardTasks();

      if (Array.isArray(data)) {
        setTasks(data);
      } else if (Array.isArray(data?.data)) {
        setTasks(data.data);
      } else {
        setTasks([]);
      }
    } catch (error) {
      alert(error.message || "Error cargando recompensas");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const buildPayload = () => {
    return {
      title: form.title.trim(),
      type: form.type,
      target_count: Number(form.target_count),
      reward_coins: Number(form.reward_coins),
      duration_seconds:
        form.type === "whatsapp_invite" ? 0 : Number(form.duration_seconds),
      sort_order: Number(form.sort_order),
      is_daily: Boolean(form.is_daily),
      is_active: Boolean(form.is_active),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Escribe un título.");
      return;
    }

    const payload = buildPayload();

    try {
      setSaving(true);

      if (editingId) {
        await updateAdminRewardTask(editingId, payload);
      } else {
        await createAdminRewardTask(payload);
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadTasks();
    } catch (error) {
      alert(error.message || "Error guardando recompensa");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);

    setForm({
      title: task.title || "Mirar anuncios",
      type: task.type || "ads",
      target_count: task.target_count ?? 1,
      reward_coins: task.reward_coins ?? 0,
      duration_seconds: task.duration_seconds ?? 30,
      is_daily: Boolean(task.is_daily),
      is_active: Boolean(task.is_active),
      sort_order: task.sort_order ?? 0,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta recompensa?")) return;

    try {
      await deleteAdminRewardTask(id);
      await loadTasks();
    } catch (error) {
      alert(error.message || "Error eliminando recompensa");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>🎁 Recompensas</h1>
          <p>Administra tareas diarias para ganar monedas.</p>
        </div>
      </header>

      <section className="admin-card">
        <h2>{editingId ? "Editar recompensa" : "Agregar recompensa"}</h2>

        <form className="admin-form-grid" onSubmit={handleSubmit}>
          <label>
            Título
            <input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ej: Mirar anuncios"
            />
          </label>

          <label>
            Tipo
            <select
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
            >
              <option value="ads">Anuncios</option>
              <option value="whatsapp_invite">
                Invitar amigos por WhatsApp
              </option>
            </select>
          </label>

          <label>
            Cantidad requerida
            <input
              type="number"
              min="1"
              value={form.target_count}
              onChange={(e) => handleChange("target_count", e.target.value)}
            />
          </label>

          <label>
            Monedas a ganar
            <input
              type="number"
              min="0"
              value={form.reward_coins}
              onChange={(e) => handleChange("reward_coins", e.target.value)}
            />
          </label>

          {form.type === "ads" && (
            <label>
              Duración por anuncio
              <input
                type="number"
                min="0"
                value={form.duration_seconds}
                onChange={(e) =>
                  handleChange("duration_seconds", e.target.value)
                }
              />
            </label>
          )}

          <label>
            Orden
            <input
              type="number"
              min="0"
              value={form.sort_order}
              onChange={(e) => handleChange("sort_order", e.target.value)}
            />
          </label>

          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.is_daily}
              onChange={(e) => handleChange("is_daily", e.target.checked)}
            />
            Tarea diaria
          </label>

          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => handleChange("is_active", e.target.checked)}
            />
            Activo
          </label>

          <div className="admin-form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Guardando..." : editingId ? "Actualizar" : "Guardar"}
            </button>

            {editingId && (
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={resetForm}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-card">
        <h2>Lista de recompensas</h2>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Monedas</th>
                  <th>Duración</th>
                  <th>Diaria</th>
                  <th>Activo</th>
                  <th>Orden</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="10">No hay recompensas creadas.</td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id}>
                      <td>{task.id}</td>
                      <td>{task.title}</td>
                      <td>{task.type === "ads" ? "Anuncios" : "WhatsApp"}</td>
                      <td>{task.target_count}</td>
                      <td>{task.reward_coins} 🪙</td>
                      <td>
                        {task.type === "ads"
                          ? `${task.duration_seconds}s`
                          : "-"}
                      </td>
                      <td>{task.is_daily ? "Sí" : "No"}</td>
                      <td>{task.is_active ? "Sí" : "No"}</td>
                      <td>{task.sort_order}</td>
                      <td>
                        <button type="button" onClick={() => handleEdit(task)}>
                          Editar
                        </button>

                        <button
                          type="button"
                          className="admin-btn-danger"
                          onClick={() => handleDelete(task.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
