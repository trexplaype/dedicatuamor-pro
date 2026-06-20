import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteAdminPlan,
  getAdminPlans,
  updateAdminPlan,
} from "../../services/admin/planAdminService";

const ASSET_FIELDS = [
  "allow_upload_assets",
  "allow_external_assets",
  "use_default_assets",
  "max_upload_images",
  "max_upload_music",
  "max_upload_videos",
  "max_upload_audios",
  "max_upload_files",
  "max_external_images",
  "max_external_music",
  "max_external_videos",
  "max_external_audios",
  "max_external_files",
];

const ASSET_LABELS = {
  max_upload_images: "📸 Fotos subidas desde dispositivo",
  max_upload_music: "🎵 Música subida desde dispositivo",
  max_upload_videos: "🎬 Videos subidos desde dispositivo",
  max_upload_audios: "🎤 Audios subidos desde dispositivo",
  max_upload_files: "📁 Archivos subidos desde dispositivo",

  max_external_images: "🌐 Fotos mediante URL",
  max_external_music: "🌐 Música mediante URL",
  max_external_videos: "🌐 Videos mediante URL",
  max_external_audios: "🌐 Audios mediante URL",
  max_external_files: "🌐 Archivos mediante URL",
};

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  }

  async function loadPlans() {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error al cargar planes");
    } finally {
      setLoading(false);
    }
  }

  function openEdit(plan) {
    setError("");
    setEditing(plan);

    setEditForm({
      name: plan.name || "",
      slug: plan.slug || "",
      price_type: plan.price_type || "coins",
      price_amount: Number(plan.price_amount || 0),

      duration_value: Number(plan.duration_value ?? 30),
      duration_unit: plan.duration_unit || "days",

      page_duration_value: Number(plan.page_duration_value ?? 30),
      page_duration_unit: plan.page_duration_unit || "days",

      max_pages_per_day: Number(plan.max_pages_per_day ?? 2),

      max_active_pages: Number(plan.max_active_pages ?? plan.max_pages ?? 0),

      max_storage_mb: Number(plan.max_storage_mb || 0),

      has_qr: Boolean(plan.has_qr),
      access_level: plan.access_level || "free",
      is_active: Boolean(plan.is_active),
      monthly_limit: plan.monthly_limit || "",
      discount_percent: Number(plan.discount_percent || 0),
      discount_ends_at: plan.discount_ends_at
        ? String(plan.discount_ends_at).slice(0, 16)
        : "",
      only_new_users: Boolean(plan.only_new_users),

      allow_upload_assets: Boolean(plan.allow_upload_assets),
      allow_external_assets: Boolean(plan.allow_external_assets),
      use_default_assets: Boolean(plan.use_default_assets),

      max_upload_images: Number(plan.max_upload_images || 0),
      max_upload_music: Number(plan.max_upload_music || 0),
      max_upload_videos: Number(plan.max_upload_videos || 0),
      max_upload_audios: Number(plan.max_upload_audios || 0),
      max_upload_files: Number(plan.max_upload_files || 0),

      max_external_images: Number(plan.max_external_images || 0),
      max_external_music: Number(plan.max_external_music || 0),
      max_external_videos: Number(plan.max_external_videos || 0),
      max_external_audios: Number(plan.max_external_audios || 0),
      max_external_files: Number(plan.max_external_files || 0),

      features_text: Array.isArray(plan.features)
        ? plan.features.join("\n")
        : "",
    });
  }

  function updateField(name, value) {
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function numberValue(value) {
    return Number(value || 0);
  }

  async function saveEdit() {
    try {
      setError("");

      const maxActivePages = numberValue(editForm.max_active_pages);

      const payload = {
        name: editForm.name,
        slug: editForm.slug,
        price_type: editForm.price_type,
        price_amount: numberValue(editForm.price_amount),

        duration_value: numberValue(editForm.duration_value),
        duration_unit: editForm.duration_unit || "days",

        page_duration_value: numberValue(editForm.page_duration_value),
        page_duration_unit: editForm.page_duration_unit || "days",

        max_pages_per_day: numberValue(editForm.max_pages_per_day),

        max_active_pages: maxActivePages,

        max_pages: maxActivePages,

        max_storage_mb: numberValue(editForm.max_storage_mb),

        has_qr: Boolean(editForm.has_qr),
        access_level: editForm.access_level,

        features: editForm.features_text
          ? editForm.features_text
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],

        monthly_limit: editForm.monthly_limit
          ? Number(editForm.monthly_limit)
          : null,

        discount_percent: numberValue(editForm.discount_percent),
        discount_ends_at: editForm.discount_ends_at || null,
        is_active: Boolean(editForm.is_active),
        only_new_users: Boolean(editForm.only_new_users),

        allow_upload_assets: Boolean(editForm.allow_upload_assets),
        allow_external_assets: Boolean(editForm.allow_external_assets),
        use_default_assets: Boolean(editForm.use_default_assets),

        max_upload_images: numberValue(editForm.max_upload_images),
        max_upload_music: numberValue(editForm.max_upload_music),
        max_upload_videos: numberValue(editForm.max_upload_videos),
        max_upload_audios: numberValue(editForm.max_upload_audios),
        max_upload_files: numberValue(editForm.max_upload_files),

        max_external_images: numberValue(editForm.max_external_images),
        max_external_music: numberValue(editForm.max_external_music),
        max_external_videos: numberValue(editForm.max_external_videos),
        max_external_audios: numberValue(editForm.max_external_audios),
        max_external_files: numberValue(editForm.max_external_files),
      };

      await updateAdminPlan(editing.id, payload);

      setEditing(null);
      showToast("✅ Plan actualizado correctamente.");
      loadPlans();
    } catch (err) {
      setError(err.message || "Error al actualizar plan");
    }
  }

  async function toggleActive(plan) {
    try {
      setError("");

      await updateAdminPlan(plan.id, {
        is_active: !plan.is_active,
      });

      showToast(
        plan.is_active
          ? "🔒 Plan desactivado correctamente."
          : "🟢 Plan activado correctamente.",
      );

      loadPlans();
    } catch (err) {
      setError(err.message || "Error al cambiar estado");
    }
  }

  async function confirmDeletePlan() {
    try {
      setError("");
      await deleteAdminPlan(confirmDelete.id);
      setConfirmDelete(null);
      showToast("🗑️ Plan eliminado correctamente.");
      loadPlans();
    } catch (err) {
      setError(err.message || "Error al eliminar plan");
      setConfirmDelete(null);
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  if (loading) return <p>Cargando planes...</p>;

  return (
    <section>
      <div className="admin-page-header">
        <h1>💎 Planes</h1>
        <p>Administra FREE, PREMIUM, VIP y SUPER USER.</p>

        <Link to="/admin/plans/create" className="admin-back-button">
          ➕ Crear Plan
        </Link>
      </div>

      {error && <div className="admin-alert error">⚠️ {error}</div>}
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Plan</th>
              <th>Precio</th>
              <th>Duración</th>
              <th>Páginas/día</th>
              <th>Páginas totales</th>
              <th>Archivos</th>
              <th>Acceso</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td>{plan.id}</td>

                <td>
                  <strong>{plan.name}</strong>
                  <br />
                  <small>{plan.slug}</small>
                </td>

                <td>
                  {plan.price_type === "free"
                    ? "Gratis"
                    : `${Number(plan.price_amount || 0)} 🪙`}
                </td>

                <td>
                  Plan: {Number(plan.duration_value || 0)}{" "}
                  {plan.duration_unit === "hours" ? "horas" : "días"}
                  <br />
                  Página: {Number(plan.page_duration_value || 0)}{" "}
                  {plan.page_duration_unit === "hours" ? "horas" : "días"}
                </td>

                <td>{Number(plan.max_pages_per_day || 0)}</td>

                <td>{Number(plan.max_active_pages ?? plan.max_pages ?? 0)}</td>

                <td>
                  <small>
                    Predeterminados: {plan.use_default_assets ? "✅" : "❌"}
                    <br />
                    Subida directa: {plan.allow_upload_assets ? "✅" : "❌"}
                    <br />
                    URL externa: {plan.allow_external_assets ? "✅" : "❌"}
                  </small>
                </td>

                <td>
                  <span
                    className={`admin-badge ${plan.access_level || "free"}`}
                  >
                    {plan.access_level}
                  </span>
                </td>

                <td>
                  {plan.is_active ? "✅ Activo" : "🔒 Inactivo"}
                  {plan.is_sold_out_this_month ? " / 🔥 Agotado" : ""}
                </td>

                <td className="admin-actions-inline">
                  <button type="button" onClick={() => openEdit(plan)}>
                    ✏️ Editar
                  </button>

                  <button type="button" onClick={() => toggleActive(plan)}>
                    {plan.is_active ? "🔒 Desactivar" : "🟢 Activar"}
                  </button>

                  <button type="button" onClick={() => setConfirmDelete(plan)}>
                    🗑 Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {plans.length === 0 && (
              <tr>
                <td colSpan="10" className="admin-empty">
                  No hay planes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="admin-modal">
          <div className="admin-modal-card large">
            <button
              type="button"
              className="admin-modal-close"
              onClick={() => setEditing(null)}
            >
              ×
            </button>

            <h2>Editar plan</h2>

            <div className="admin-grid">
              <label>
                Nombre
                <input
                  value={editForm.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </label>

              <label>
                Slug
                <input
                  value={editForm.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                />
              </label>

              <label>
                Tipo de precio
                <select
                  value={editForm.price_type}
                  onChange={(e) => updateField("price_type", e.target.value)}
                >
                  <option value="free">Gratis</option>
                  <option value="coins">Monedas</option>
                  <option value="money">Soles</option>
                </select>
              </label>

              <label>
                Precio
                <input
                  type="number"
                  value={editForm.price_amount}
                  onChange={(e) => updateField("price_amount", e.target.value)}
                  min="0"
                />
              </label>

              <label>
                Duración del plan
                <input
                  type="number"
                  value={editForm.duration_value}
                  onChange={(e) =>
                    updateField("duration_value", e.target.value)
                  }
                  min="0"
                />
              </label>

              <label>
                Unidad duración plan
                <select
                  value={editForm.duration_unit}
                  onChange={(e) => updateField("duration_unit", e.target.value)}
                >
                  <option value="hours">Horas</option>
                  <option value="days">Días</option>
                </select>
              </label>

              <label>
                Duración de cada página
                <input
                  type="number"
                  value={editForm.page_duration_value}
                  onChange={(e) =>
                    updateField("page_duration_value", e.target.value)
                  }
                  min="1"
                />
              </label>

              <label>
                Unidad duración página
                <select
                  value={editForm.page_duration_unit}
                  onChange={(e) =>
                    updateField("page_duration_unit", e.target.value)
                  }
                >
                  <option value="hours">Horas</option>
                  <option value="days">Días</option>
                </select>
              </label>

              <label>
                Páginas por día
                <input
                  type="number"
                  value={editForm.max_pages_per_day}
                  onChange={(e) =>
                    updateField("max_pages_per_day", e.target.value)
                  }
                  min="0"
                />
              </label>

              <label>
                Páginas totales activas
                <input
                  type="number"
                  value={editForm.max_active_pages}
                  onChange={(e) =>
                    updateField("max_active_pages", e.target.value)
                  }
                  min="0"
                />
              </label>

              <label>
                Acceso
                <select
                  value={editForm.access_level}
                  onChange={(e) => updateField("access_level", e.target.value)}
                >
                  <option value="free">FREE</option>
                  <option value="premium">PREMIUM</option>
                  <option value="vip">VIP</option>
                  <option value="exclusive">SUPER USER / EXCLUSIVE</option>
                  <option value="super-user">SUPER USER</option>
                </select>
              </label>

              <label>
                Almacenamiento MB
                <input
                  type="number"
                  value={editForm.max_storage_mb}
                  onChange={(e) =>
                    updateField("max_storage_mb", e.target.value)
                  }
                  min="0"
                />
              </label>

              <label>
                Límite mensual
                <input
                  type="number"
                  value={editForm.monthly_limit}
                  onChange={(e) => updateField("monthly_limit", e.target.value)}
                  placeholder="Opcional"
                />
              </label>

              <label>
                Descuento %
                <input
                  type="number"
                  value={editForm.discount_percent}
                  onChange={(e) =>
                    updateField("discount_percent", e.target.value)
                  }
                  min="0"
                  max="100"
                />
              </label>

              <label>
                Fin descuento
                <input
                  type="datetime-local"
                  value={editForm.discount_ends_at}
                  onChange={(e) =>
                    updateField("discount_ends_at", e.target.value)
                  }
                />
              </label>
            </div>

            <section className="admin-card">
              <h3>Permisos de archivos multimedia</h3>

              <div className="admin-checks">
                <label>
                  <input
                    type="checkbox"
                    checked={editForm.use_default_assets}
                    onChange={(e) =>
                      updateField("use_default_assets", e.target.checked)
                    }
                  />
                  Usar archivos predeterminados de la plantilla
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={editForm.allow_upload_assets}
                    onChange={(e) =>
                      updateField("allow_upload_assets", e.target.checked)
                    }
                  />
                  Permitir subir archivos desde el dispositivo
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={editForm.allow_external_assets}
                    onChange={(e) =>
                      updateField("allow_external_assets", e.target.checked)
                    }
                  />
                  Permitir usar archivos mediante URL externa
                </label>
              </div>

              <div className="admin-grid">
                {ASSET_FIELDS.filter((field) => field.startsWith("max_")).map(
                  (field) => (
                    <label key={field}>
                      {ASSET_LABELS[field] || field}
                      <input
                        type="number"
                        value={editForm[field] || 0}
                        onChange={(e) => updateField(field, e.target.value)}
                        min="0"
                      />
                    </label>
                  ),
                )}
              </div>
            </section>

            <label>
              Beneficios del plan
              <textarea
                rows="8"
                value={editForm.features_text || ""}
                onChange={(e) => updateField("features_text", e.target.value)}
                placeholder="Escribe un beneficio por línea"
              />
            </label>

            <div className="admin-checks">
              <label>
                <input
                  type="checkbox"
                  checked={editForm.has_qr}
                  onChange={(e) => updateField("has_qr", e.target.checked)}
                />
                Código QR personalizado
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) => updateField("is_active", e.target.checked)}
                />
                Activo
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={editForm.only_new_users}
                  onChange={(e) =>
                    updateField("only_new_users", e.target.checked)
                  }
                />
                Solo nuevos usuarios
              </label>
            </div>

            <div className="admin-actions">
              <button type="button" onClick={() => setEditing(null)}>
                Cancelar
              </button>

              <button type="button" onClick={saveEdit}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="admin-modal">
          <div className="admin-modal-card">
            <h2>Eliminar plan</h2>

            <p>
              ¿Seguro que deseas eliminar el plan{" "}
              <strong>{confirmDelete.name}</strong>?
            </p>

            <div className="admin-actions">
              <button type="button" onClick={() => setConfirmDelete(null)}>
                Cancelar
              </button>

              <button type="button" onClick={confirmDeletePlan}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
