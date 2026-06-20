import { useEffect, useState } from "react";
import {
  createTemplate,
  deleteTemplate,
  getTemplates,
  updateTemplate,
} from "../../services/admin/templateAdminService";
import { getAdminTemplateCategories } from "../../services/admin/adminTemplateCategoryService";

const PLAN_OPTIONS = [
  { value: "free", label: "Gratis" },
  { value: "premium", label: "Premium" },
  { value: "vip", label: "VIP" },
  { value: "super-user", label: "Super User" },
  { value: "admin-only", label: "Solo Admin" },
];

const ACCESS_TYPES = [
  { value: "subscription", label: "Suscripción" },
  { value: "individual", label: "Compra individual" },
  { value: "both", label: "Ambas opciones" },
];

const BOOLEAN_FIELDS = [
  "is_free",
  "is_active",
  "allow_upload_assets",
  "allow_external_assets",
  "use_default_assets",
  "allow_free_initial_use",
  "allow_individual_purchase",
];

const ASSET_FIELDS = [
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

function getPlanLabel(value) {
  return (
    PLAN_OPTIONS.find((plan) => plan.value === value)?.label ||
    value ||
    "Gratis"
  );
}

function getAccessLabel(value) {
  return (
    ACCESS_TYPES.find((item) => item.value === value)?.label || "Suscripción"
  );
}

function boolValue(value, defaultValue = false) {
  return Boolean(value ?? defaultValue);
}

function numberValue(value, defaultValue = 0) {
  return Number(value ?? defaultValue);
}

function makeSlug(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function resolveAccessType(template) {
  if (template.access_type) return template.access_type;

  if (template.allow_individual_purchase && template.required_plan) {
    return "both";
  }

  if (template.allow_individual_purchase) {
    return "individual";
  }

  return "subscription";
}

export default function AdminTemplates() {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
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

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [templatesData, categoriesData] = await Promise.all([
        getTemplates(),
        getAdminTemplateCategories(),
      ]);

      setTemplates(
        Array.isArray(templatesData)
          ? templatesData
          : templatesData.templates || [],
      );

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      setError(err.message || "Error al cargar plantillas");
    } finally {
      setLoading(false);
    }
  }

  function getCategoryName(template) {
    const found = categories.find(
      (cat) => Number(cat.id) === Number(template.category_id),
    );

    return found?.name || template.category || "Sin categoría";
  }

  function updateEditField(name, value) {
    setEditForm((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === "name") {
        next.slug = makeSlug(value);
      }

      return next;
    });
  }

  function openEdit(template) {
    const requiredPlan = template.required_plan || "free";
    const accessType = resolveAccessType(template);

    setEditing(template);
    setError("");

    setEditForm({
      name: template.name || "",
      title: template.title || template.name || "Plantilla",
      slug: template.slug || "",
      category: template.category || "",
      category_id: template.category_id || "",

      required_plan: requiredPlan,
      access_type: accessType,

      allow_free_initial_use: boolValue(template.allow_free_initial_use, true),
      free_initial_page_limit: numberValue(template.free_initial_page_limit, 2),

      allow_individual_purchase:
        accessType === "individual" || accessType === "both",
      individual_price_coins: numberValue(
        template.individual_price_coins,
        template.price_coins || 0,
      ),

      max_pages_by_plan: numberValue(template.max_pages_by_plan, 5),
      max_pages_by_purchase: numberValue(template.max_pages_by_purchase, 5),

      access_duration_value: numberValue(template.access_duration_value, 30),
      access_duration_unit: template.access_duration_unit || "days",

      page_duration_value: numberValue(template.page_duration_value, 30),
      page_duration_unit: template.page_duration_unit || "days",

      admin_retention_days: numberValue(template.admin_retention_days, 3),

      description: template.description || "",
      price_coins: numberValue(template.price_coins, 0),
      is_free: boolValue(template.is_free),
      is_active: boolValue(template.is_active),
      status: template.status || "active",

      html_content: template.html_content || "",
      css_content: template.css_content || "",
      js_content: template.js_content || "",
      fields_json: JSON.stringify(template.fields_json || [], null, 2),

      allow_upload_assets: boolValue(template.allow_upload_assets),
      allow_external_assets: boolValue(template.allow_external_assets),
      use_default_assets: boolValue(template.use_default_assets, true),

      max_upload_images: numberValue(template.max_upload_images),
      max_upload_music: numberValue(template.max_upload_music),
      max_upload_videos: numberValue(template.max_upload_videos),
      max_upload_audios: numberValue(template.max_upload_audios),
      max_upload_files: numberValue(template.max_upload_files),

      max_external_images: numberValue(template.max_external_images),
      max_external_music: numberValue(template.max_external_music),
      max_external_videos: numberValue(template.max_external_videos),
      max_external_audios: numberValue(template.max_external_audios),
      max_external_files: numberValue(template.max_external_files),
    });
  }

  async function saveEdit() {
    try {
      setError("");
      JSON.parse(editForm.fields_json || "[]");

      const accessType = editForm.access_type || "subscription";
      const allowIndividualPurchase =
        accessType === "individual" || accessType === "both";

      const formData = new FormData();

      Object.entries(editForm).forEach(([key, value]) => {
        if (key === "access_type") return;

        if (BOOLEAN_FIELDS.includes(key)) {
          formData.append(key, value ? "1" : "0");
          return;
        }

        if (key === "fields_json") {
          formData.append("fields_json", value || "[]");
          return;
        }

        formData.append(key, value ?? "");
      });

      formData.set(
        "allow_individual_purchase",
        allowIndividualPurchase ? "1" : "0",
      );
      formData.set("required_plan", editForm.required_plan || "free");

      await updateTemplate(editing.id, formData);

      setEditing(null);
      showToast("✅ Plantilla actualizada correctamente.");
      loadData();
    } catch (err) {
      setError(err.message || "Error al guardar plantilla.");
    }
  }

  async function toggleActive(template) {
    try {
      const requiredPlan = template.required_plan || "free";
      const formData = new FormData();

      formData.append("title", template.title || template.name || "Plantilla");
      formData.append("is_active", template.is_active ? "0" : "1");
      formData.append("status", template.is_active ? "inactive" : "active");
      formData.append("is_free", template.is_free ? "1" : "0");

      formData.append("required_plan", requiredPlan);

      await updateTemplate(template.id, formData);

      showToast(
        template.is_active
          ? "🔒 Plantilla desactivada correctamente."
          : "🟢 Plantilla activada correctamente.",
      );

      loadData();
    } catch (err) {
      setError(err.message || "Error al cambiar estado.");
    }
  }

  async function duplicateTemplate(template) {
    try {
      const requiredPlan = template.required_plan || "free";
      const accessType = resolveAccessType(template);
      const allowIndividualPurchase =
        accessType === "individual" || accessType === "both";

      const formData = new FormData();

      formData.append("name", `${template.name || template.title} Copia`);
      formData.append("title", `${template.title || template.name} Copia`);
      formData.append(
        "slug",
        `${template.slug || template.id}-copia-${Date.now()}`,
      );
      formData.append("category", template.category || "");
      formData.append("category_id", template.category_id || "");

      formData.append("required_plan", requiredPlan);

      formData.append(
        "allow_free_initial_use",
        template.allow_free_initial_use ? "1" : "0",
      );
      formData.append(
        "free_initial_page_limit",
        template.free_initial_page_limit ?? 2,
      );
      formData.append(
        "allow_individual_purchase",
        allowIndividualPurchase ? "1" : "0",
      );
      formData.append(
        "individual_price_coins",
        template.individual_price_coins ?? 0,
      );

      formData.append("max_pages_by_plan", template.max_pages_by_plan ?? 5);
      formData.append(
        "max_pages_by_purchase",
        template.max_pages_by_purchase ?? 5,
      );

      formData.append(
        "access_duration_value",
        template.access_duration_value ?? 30,
      );

      formData.append(
        "access_duration_unit",
        template.access_duration_unit ?? "days",
      );

      formData.append(
        "page_duration_value",
        template.page_duration_value ?? 30,
      );

      formData.append(
        "page_duration_unit",
        template.page_duration_unit ?? "days",
      );

      formData.append(
        "admin_retention_days",
        template.admin_retention_days ?? 3,
      );

      formData.append("description", template.description || "");
      formData.append("price_coins", template.price_coins || 0);
      formData.append("is_free", template.is_free ? "1" : "0");
      formData.append("is_active", "0");
      formData.append("status", "inactive");

      formData.append("html_content", template.html_content || "");
      formData.append("css_content", template.css_content || "");
      formData.append("js_content", template.js_content || "");
      formData.append(
        "fields_json",
        JSON.stringify(template.fields_json || []),
      );

      formData.append(
        "allow_upload_assets",
        template.allow_upload_assets ? "1" : "0",
      );
      formData.append(
        "allow_external_assets",
        template.allow_external_assets ? "1" : "0",
      );
      formData.append(
        "use_default_assets",
        template.use_default_assets ? "1" : "0",
      );

      ASSET_FIELDS.forEach((field) => {
        formData.append(field, template[field] || 0);
      });

      await createTemplate(formData);

      showToast("📄 Plantilla duplicada correctamente.");
      loadData();
    } catch (err) {
      setError(err.message || "Error al duplicar plantilla.");
    }
  }

  async function confirmDeleteTemplate() {
    try {
      await deleteTemplate(confirmDelete.id);

      setConfirmDelete(null);
      showToast("🗑️ Plantilla eliminada correctamente.");
      loadData();
    } catch (err) {
      setError(err.message || "Error al eliminar plantilla.");
      setConfirmDelete(null);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <p>Cargando plantillas...</p>;

  return (
    <section>
      <div className="admin-page-header">
        <h1>📋 Plantillas</h1>
        <p>
          Gestiona categorías, nivel requerido, acceso, precios, estado y
          archivos.
        </p>
      </div>

      {error && <div className="admin-alert error">⚠️ {error}</div>}
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Nivel</th>
              <th>Acceso</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {templates.map((template) => {
              const requiredPlan = template.required_plan || "free";
              const accessType = resolveAccessType(template);

              return (
                <tr key={template.id}>
                  <td>{template.id}</td>

                  <td>
                    <strong>{template.title || template.name}</strong>
                    <br />
                    <small>{template.slug}</small>
                  </td>

                  <td>{getCategoryName(template)}</td>

                  <td>
                    <span className={`admin-badge ${requiredPlan}`}>
                      {getPlanLabel(requiredPlan)}
                    </span>
                  </td>

                  <td>
                    {getAccessLabel(accessType)}
                    <br />
                    <small>
                      Gratis inicial:{" "}
                      {template.allow_free_initial_use ? "Sí" : "No"}
                      <br />
                      Límite: {template.free_initial_page_limit ?? 2}
                    </small>
                  </td>

                  <td>
                    {template.is_free
                      ? "Gratis"
                      : `${template.price_coins || 0} 🪙`}
                    <br />
                    <small>
                      Individual: {template.individual_price_coins || 0} 🪙
                    </small>
                  </td>

                  <td>{template.is_active ? "✅ Activa" : "🔒 Inactiva"}</td>

                  <td className="admin-actions-inline">
                    <button type="button" onClick={() => setSelected(template)}>
                      👁 Ver
                    </button>
                    <button type="button" onClick={() => openEdit(template)}>
                      ✏️ Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateTemplate(template)}
                    >
                      📄 Duplicar
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(template)}
                    >
                      {template.is_active ? "🔒 Desactivar" : "🟢 Activar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(template)}
                    >
                      🗑 Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}

            {templates.length === 0 && (
              <tr>
                <td colSpan="8" className="admin-empty">
                  No hay plantillas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="admin-modal">
          <div className="admin-modal-card">
            <button
              type="button"
              className="admin-modal-close"
              onClick={() => setSelected(null)}
            >
              ×
            </button>

            <h2>{selected.title || selected.name}</h2>
            <p>{selected.description || "Sin descripción."}</p>

            <div className="admin-detail-grid">
              <div>
                <strong>Categoría:</strong>
                <p>{getCategoryName(selected)}</p>
              </div>

              <div>
                <strong>Nivel requerido:</strong>
                <p>{getPlanLabel(selected.required_plan || "free")}</p>
              </div>

              <div>
                <strong>Acceso:</strong>
                <p>{getAccessLabel(resolveAccessType(selected))}</p>
              </div>

              <div>
                <strong>Reglas FREE:</strong>
                <p>
                  Prueba gratis: {selected.allow_free_initial_use ? "Sí" : "No"}
                  <br />
                  Límite gratis: {selected.free_initial_page_limit ?? 2} páginas
                </p>
              </div>

              <div>
                <strong>Compra individual:</strong>
                <p>
                  {selected.allow_individual_purchase
                    ? "Permitida"
                    : "No permitida"}
                  <br />
                  Precio: {selected.individual_price_coins || 0} 🪙
                </p>
              </div>

              <div>
                <strong>Archivos:</strong>
                <p>
                  Predeterminados: {selected.use_default_assets ? "Sí" : "No"}
                  <br />
                  Subida directa: {selected.allow_upload_assets ? "Sí" : "No"}
                  <br />
                  URL externa: {selected.allow_external_assets ? "Sí" : "No"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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

            <h2>Editar plantilla</h2>

            <section className="admin-card">
              <h3>Información general</h3>

              <div className="admin-grid">
                <label>
                  Nombre
                  <input
                    value={editForm.name}
                    onChange={(e) => updateEditField("name", e.target.value)}
                  />
                </label>

                <label>
                  Slug automático
                  <input value={editForm.slug} readOnly />
                </label>

                <label>
                  Título visible
                  <input
                    value={editForm.title}
                    onChange={(e) => updateEditField("title", e.target.value)}
                  />
                </label>

                <label>
                  Categoría
                  <select
                    value={editForm.category_id}
                    onChange={(e) => {
                      const category = categories.find(
                        (item) => Number(item.id) === Number(e.target.value),
                      );

                      setEditForm({
                        ...editForm,
                        category_id: e.target.value,
                        category: category?.slug || "",
                      });
                    }}
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Descripción
                <textarea
                  rows="4"
                  value={editForm.description}
                  onChange={(e) =>
                    updateEditField("description", e.target.value)
                  }
                />
              </label>
            </section>

            <section className="admin-card">
              <h3>Acceso y disponibilidad</h3>

              <div className="admin-grid">
                <label>
                  Nivel requerido
                  <select
                    value={editForm.required_plan}
                    onChange={(e) =>
                      updateEditField("required_plan", e.target.value)
                    }
                  >
                    {PLAN_OPTIONS.map((plan) => (
                      <option key={plan.value} value={plan.value}>
                        {plan.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Máximo páginas por plantilla
                  <input
                    type="number"
                    min="1"
                    value={editForm.max_pages_by_plan}
                    onChange={(e) =>
                      updateEditField("max_pages_by_plan", e.target.value)
                    }
                  />
                </label>

                <label>
                  Tipo de acceso
                  <select
                    value={editForm.access_type}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditForm((prev) => ({
                        ...prev,
                        access_type: value,
                        allow_individual_purchase:
                          value === "individual" || value === "both",
                      }));
                    }}
                  >
                    {ACCESS_TYPES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="admin-card">
              <h3>Prueba gratis para usuarios FREE</h3>

              <div className="admin-grid">
                <label>
                  Límite de páginas gratis
                  <input
                    type="number"
                    min="0"
                    value={editForm.free_initial_page_limit}
                    onChange={(e) =>
                      updateEditField("free_initial_page_limit", e.target.value)
                    }
                  />
                </label>

                <label>
                  Precio compra individual
                  <input
                    type="number"
                    min="0"
                    value={editForm.individual_price_coins}
                    onChange={(e) =>
                      updateEditField("individual_price_coins", e.target.value)
                    }
                  />
                </label>

                <label>
                  Máximo páginas por compra
                  <input
                    type="number"
                    min="1"
                    value={editForm.max_pages_by_purchase}
                    onChange={(e) =>
                      updateEditField("max_pages_by_purchase", e.target.value)
                    }
                  />
                </label>

                <label>
                  Duración acceso comprado
                  <input
                    type="number"
                    min="1"
                    value={editForm.access_duration_value}
                    onChange={(e) =>
                      updateEditField("access_duration_value", e.target.value)
                    }
                  />
                </label>

                <label>
                  Unidad acceso
                  <select
                    value={editForm.access_duration_unit}
                    onChange={(e) =>
                      updateEditField("access_duration_unit", e.target.value)
                    }
                  >
                    <option value="hours">Horas</option>
                    <option value="days">Días</option>
                  </select>
                </label>

                <label>
                  Duración página comprada
                  <input
                    type="number"
                    min="1"
                    value={editForm.page_duration_value}
                    onChange={(e) =>
                      updateEditField("page_duration_value", e.target.value)
                    }
                  />
                </label>

                <label>
                  Unidad página
                  <select
                    value={editForm.page_duration_unit}
                    onChange={(e) =>
                      updateEditField("page_duration_unit", e.target.value)
                    }
                  >
                    <option value="hours">Horas</option>
                    <option value="days">Días</option>
                  </select>
                </label>

                <label>
                  Retención admin (días)
                  <input
                    type="number"
                    min="0"
                    value={editForm.admin_retention_days}
                    onChange={(e) =>
                      updateEditField("admin_retention_days", e.target.value)
                    }
                  />
                </label>
              </div>

              <div className="admin-checks">
                <label>
                  <input
                    type="checkbox"
                    checked={editForm.allow_free_initial_use}
                    onChange={(e) =>
                      updateEditField(
                        "allow_free_initial_use",
                        e.target.checked,
                      )
                    }
                  />
                  Permitir prueba gratis inicial
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={editForm.allow_individual_purchase}
                    onChange={(e) =>
                      updateEditField(
                        "allow_individual_purchase",
                        e.target.checked,
                      )
                    }
                  />
                  Permitir compra individual solo si no tiene suscripción
                </label>
              </div>
            </section>

            <section className="admin-card">
              <h3>Permisos de archivos multimedia</h3>

              <div className="admin-checks">
                <label>
                  <input
                    type="checkbox"
                    checked={editForm.use_default_assets}
                    onChange={(e) =>
                      updateEditField("use_default_assets", e.target.checked)
                    }
                  />
                  Usar archivos predeterminados de la plantilla
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={editForm.allow_upload_assets}
                    onChange={(e) =>
                      updateEditField("allow_upload_assets", e.target.checked)
                    }
                  />
                  Permitir subir archivos desde el dispositivo
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={editForm.allow_external_assets}
                    onChange={(e) =>
                      updateEditField("allow_external_assets", e.target.checked)
                    }
                  />
                  Permitir usar archivos mediante URL externa
                </label>
              </div>

              <div className="admin-grid">
                {ASSET_FIELDS.map((field) => (
                  <label key={field}>
                    {ASSET_LABELS[field] || field}
                    <input
                      type="number"
                      min="0"
                      value={editForm[field] || 0}
                      onChange={(e) => updateEditField(field, e.target.value)}
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="admin-card">
              <h3>Contenido</h3>

              <label>
                HTML
                <textarea
                  rows="8"
                  value={editForm.html_content}
                  onChange={(e) =>
                    updateEditField("html_content", e.target.value)
                  }
                />
              </label>

              <label>
                CSS
                <textarea
                  rows="8"
                  value={editForm.css_content}
                  onChange={(e) =>
                    updateEditField("css_content", e.target.value)
                  }
                />
              </label>

              <label>
                JavaScript
                <textarea
                  rows="8"
                  value={editForm.js_content}
                  onChange={(e) =>
                    updateEditField("js_content", e.target.value)
                  }
                />
              </label>

              <label>
                Campos JSON
                <textarea
                  rows="8"
                  value={editForm.fields_json}
                  onChange={(e) =>
                    updateEditField("fields_json", e.target.value)
                  }
                />
              </label>
            </section>

            <div className="admin-checks">
              <label>
                <input
                  type="checkbox"
                  checked={editForm.is_free}
                  onChange={(e) => updateEditField("is_free", e.target.checked)}
                />
                Gratis
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) =>
                    updateEditField("is_active", e.target.checked)
                  }
                />
                Activa
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
          <div className="admin-modal-card small">
            <h2>Eliminar plantilla</h2>
            <p>
              ¿Seguro que deseas eliminar{" "}
              <strong>{confirmDelete.title || confirmDelete.name}</strong>?
            </p>

            <div className="admin-actions">
              <button type="button" onClick={() => setConfirmDelete(null)}>
                Cancelar
              </button>
              <button type="button" onClick={confirmDeleteTemplate}>
                🗑 Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
