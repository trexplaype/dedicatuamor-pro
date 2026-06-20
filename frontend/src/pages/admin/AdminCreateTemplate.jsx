import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createTemplate,
  importTemplateZip,
} from "../../services/admin/templateAdminService";
import { getTemplateCategories } from "../../services/categoryService";

const FIELD_TYPES = [
  "text",
  "textarea",
  "image",
  "audio",
  "video",
  "color",
  "date",
  "number",
  "url",
  "gallery",
];

const PLAN_OPTIONS = [
  { value: "free", label: "Gratis" },
  { value: "premium", label: "Premium" },
  { value: "vip", label: "VIP" },
  { value: "super-user", label: "Super User" },
  { value: "admin-only", label: "Solo Admin" },
];

const ACCESS_TYPES = [
  { value: "subscription", label: "Incluida en suscripción" },
  { value: "individual", label: "Compra individual" },
  { value: "both", label: "Ambas opciones" },
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

export default function AdminCreateTemplate() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("manual");
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    title: "",
    slug: "",
    category: "",
    category_id: "",

    required_plan: "free",
    access_type: "subscription",

    allow_free_initial_use: true,
    free_initial_page_limit: 2,

    allow_individual_purchase: false,
    individual_price_coins: 50,

    max_pages_by_plan: 5,
    max_pages_by_purchase: 5,

    access_duration_value: 30,
    access_duration_unit: "days",

    page_duration_value: 30,
    page_duration_unit: "days",

    admin_retention_days: 3,

    description: "",
    price_coins: 50,
    is_free: false,
    is_active: true,
    status: "active",

    html_content: "",
    css_content: "",
    js_content: "",

    allow_upload_assets: false,
    allow_external_assets: false,
    use_default_assets: true,

    max_upload_images: 0,
    max_upload_music: 0,
    max_upload_videos: 0,
    max_upload_audios: 0,
    max_upload_files: 0,

    max_external_images: 0,
    max_external_music: 0,
    max_external_videos: 0,
    max_external_audios: 0,
    max_external_files: 0,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [htmlFile, setHtmlFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);

  const [fields, setFields] = useState([
    { name: "titulo", label: "Título", type: "text", default: "" },
    { name: "mensaje", label: "Mensaje", type: "textarea", default: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await getTemplateCategories();
      const activeCategories = Array.isArray(data)
        ? data.filter((item) => item.is_active)
        : [];

      setCategories(activeCategories);

      if (activeCategories.length > 0) {
        setForm((prev) => ({
          ...prev,
          category_id: activeCategories[0].id,
          category: activeCategories[0].slug,
        }));
      }
    } catch (error) {
      console.error(error);
    }
  }

  function makeSlug(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  function makeFieldName(text) {
    return makeSlug(text).replaceAll("-", "_");
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "name") {
        next.slug = makeSlug(value);
        next.title = value;
      }

      if (name === "access_type") {
        next.allow_individual_purchase =
          value === "individual" || value === "both";
      }

      return next;
    });
  }

  function handleCategoryChange(e) {
    const categoryId = e.target.value;
    const selected = categories.find(
      (item) => Number(item.id) === Number(categoryId),
    );

    setForm((prev) => ({
      ...prev,
      category_id: categoryId,
      category: selected?.slug || "",
    }));
  }

  function updateField(index, key, value) {
    setFields((prev) =>
      prev.map((field, i) =>
        i === index ? { ...field, [key]: value } : field,
      ),
    );
  }

  function addField() {
    setFields((prev) => [
      ...prev,
      { name: "", label: "", type: "text", default: "" },
    ]);
  }

  function removeField(index) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  function validateForm() {
    if (!form.name.trim()) return "El nombre de la plantilla es obligatorio.";
    if (!form.slug.trim()) return "El slug automático es obligatorio.";
    if (!form.category_id) return "Selecciona una categoría.";
    if (!form.required_plan) return "Selecciona el nivel requerido.";

    if (mode === "zip" && !zipFile) {
      return "Debes seleccionar un archivo ZIP.";
    }

    if (mode === "manual" && !htmlFile && !form.html_content.trim()) {
      return "Debes subir un archivo HTML o pegar el HTML.";
    }

    if (
      form.allow_individual_purchase &&
      Number(form.individual_price_coins || 0) <= 0
    ) {
      return "Agrega el precio de compra individual.";
    }

    if (!form.price_coins && !form.is_free) {
      return "Agrega un precio general o marca la plantilla como gratis.";
    }

    const invalidField = fields.find(
      (field) => !field.name.trim() || !field.label.trim(),
    );

    if (mode === "manual" && invalidField) {
      return "Todos los campos editables deben tener name y label.";
    }

    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === "access_type") return;

        if (typeof value === "boolean") {
          formData.append(key, value ? "1" : "0");
          return;
        }

        formData.append(key, value ?? "");
      });

      const allowIndividualPurchase =
        form.access_type === "individual" || form.access_type === "both";

      formData.set(
        "allow_individual_purchase",
        allowIndividualPurchase ? "1" : "0",
      );

      formData.append("required_plan", form.required_plan);

      formData.append("fields_json", JSON.stringify(fields));

      if (previewImage) formData.append("preview_image", previewImage);
      if (htmlFile) formData.append("html_file", htmlFile);
      if (zipFile) formData.append("zip_file", zipFile);

      if (mode === "zip") {
        await importTemplateZip(formData);
      } else {
        await createTemplate(formData);
      }

      alert("Plantilla creada correctamente.");
      navigate("/admin/templates");
    } catch (err) {
      setError(err.message || "Error al crear plantilla.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-top">
        <div>
          <h1>Crear plantilla</h1>
          <p>Crea una plantilla manual o importa una plantilla ZIP.</p>
        </div>

        <button
          type="button"
          className="button"
          onClick={() => navigate("/admin/templates")}
        >
          ← Volver a plantillas
        </button>
      </div>

      {error && <div className="admin-alert error">⚠️ {error}</div>}

      <div className="admin-tabs">
        <button
          type="button"
          className={mode === "manual" ? "active" : ""}
          onClick={() => setMode("manual")}
        >
          Crear manual
        </button>

        <button
          type="button"
          className={mode === "zip" ? "active" : ""}
          onClick={() => setMode("zip")}
        >
          Importar ZIP
        </button>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <section className="admin-card">
          <h2>1. Información general</h2>

          <div className="admin-grid">
            <label>
              Nombre de la plantilla
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Universo del Amor"
              />
            </label>

            <label>
              Slug automático
              <input
                name="slug"
                value={form.slug}
                readOnly
                placeholder="universo-del-amor"
              />
            </label>

            <label>
              Título visible
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Universo del Amor"
              />
            </label>

            <label>
              Categoría
              <select value={form.category_id} onChange={handleCategoryChange}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Imagen preview
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPreviewImage(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <label>
            Descripción
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Plantilla romántica con animaciones, música y carta."
              rows="3"
            />
          </label>
        </section>

        {mode === "zip" && (
          <section className="admin-card">
            <h2>2. Archivo ZIP</h2>

            <p className="admin-help-text">
              El ZIP debe contener index.html, style.css, app.js y carpeta
              assets si la plantilla tiene imágenes, música o videos.
            </p>

            <label>
              Seleccionar ZIP
              <input
                type="file"
                accept=".zip"
                onChange={(e) => setZipFile(e.target.files?.[0] || null)}
              />
            </label>
          </section>
        )}

        <section className="admin-card">
          <h2>{mode === "zip" ? "3" : "2"}. Acceso y disponibilidad</h2>

          <div className="admin-grid">
            <label>
              Nivel requerido
              <select
                name="required_plan"
                value={form.required_plan}
                onChange={handleChange}
              >
                {PLAN_OPTIONS.map((plan) => (
                  <option key={plan.value} value={plan.value}>
                    {plan.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Tipo de acceso
              <select
                name="access_type"
                value={form.access_type}
                onChange={handleChange}
              >
                {ACCESS_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Precio general en monedas
              <input
                type="number"
                name="price_coins"
                value={form.price_coins}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              Máximo páginas por plantilla
              <input
                type="number"
                min="1"
                name="max_pages_by_plan"
                value={form.max_pages_by_plan}
                onChange={handleChange}
              />
            </label>
          </div>

          <p className="admin-help-text">
            FREE puede probar FREE y PREMIUM hasta su límite. PREMIUM, VIP y
            SUPER USER heredan acceso a los niveles anteriores. ADMIN tiene
            acceso total.
          </p>
        </section>

        <section className="admin-card">
          <h2>{mode === "zip" ? "4" : "3"}. Prueba gratis para FREE</h2>

          <div className="admin-grid">
            <label>
              Límite de páginas gratis
              <input
                type="number"
                min="0"
                name="free_initial_page_limit"
                value={form.free_initial_page_limit}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="admin-checks">
            <label>
              <input
                type="checkbox"
                name="allow_free_initial_use"
                checked={form.allow_free_initial_use}
                onChange={handleChange}
              />
              Permitir prueba gratis inicial
            </label>
          </div>
        </section>

        <section className="admin-card">
          <h2>{mode === "zip" ? "5" : "4"}. Compra individual</h2>

          <div className="admin-grid">
            <label>
              Precio compra individual
              <input
                type="number"
                min="0"
                name="individual_price_coins"
                value={form.individual_price_coins}
                onChange={handleChange}
              />
            </label>

            <label>
              Máximo páginas por compra
              <input
                type="number"
                min="1"
                name="max_pages_by_purchase"
                value={form.max_pages_by_purchase}
                onChange={handleChange}
              />
            </label>

            <label>
              Duración acceso comprado
              <input
                type="number"
                min="1"
                name="access_duration_value"
                value={form.access_duration_value}
                onChange={handleChange}
              />
            </label>

            <label>
              Unidad acceso
              <select
                name="access_duration_unit"
                value={form.access_duration_unit}
                onChange={handleChange}
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
                name="page_duration_value"
                value={form.page_duration_value}
                onChange={handleChange}
              />
            </label>

            <label>
              Unidad página
              <select
                name="page_duration_unit"
                value={form.page_duration_unit}
                onChange={handleChange}
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
                name="admin_retention_days"
                value={form.admin_retention_days}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="admin-checks">
            <label>
              <input
                type="checkbox"
                name="allow_individual_purchase"
                checked={form.allow_individual_purchase}
                onChange={handleChange}
              />
              Permitir compra individual solo si no tiene suscripción
            </label>
          </div>
        </section>

        <section className="admin-card">
          <h2>{mode === "zip" ? "6" : "5"}. Permisos de archivos multimedia</h2>

          <div className="admin-checks">
            <label>
              <input
                type="checkbox"
                name="use_default_assets"
                checked={form.use_default_assets}
                onChange={handleChange}
              />
              Usar archivos predeterminados de la plantilla
            </label>

            <label>
              <input
                type="checkbox"
                name="allow_upload_assets"
                checked={form.allow_upload_assets}
                onChange={handleChange}
              />
              Permitir subir archivos desde el dispositivo
            </label>

            <label>
              <input
                type="checkbox"
                name="allow_external_assets"
                checked={form.allow_external_assets}
                onChange={handleChange}
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
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  min="0"
                />
              </label>
            ))}
          </div>
        </section>

        {mode === "manual" && (
          <>
            <section className="admin-card">
              <h2>6. Contenido HTML</h2>

              <label>
                Subir archivo HTML
                <input
                  type="file"
                  accept=".html,.txt"
                  onChange={(e) => setHtmlFile(e.target.files?.[0] || null)}
                />
              </label>

              <label>
                O pegar HTML aquí
                <textarea
                  name="html_content"
                  value={form.html_content}
                  onChange={handleChange}
                  placeholder="<div>{{titulo}}</div>"
                  rows="12"
                />
              </label>
            </section>

            <section className="admin-card">
              <h2>7. CSS</h2>

              <label>
                Pegar CSS aquí
                <textarea
                  name="css_content"
                  value={form.css_content}
                  onChange={handleChange}
                  placeholder="body { background: #05000f; }"
                  rows="10"
                />
              </label>
            </section>

            <section className="admin-card">
              <h2>8. JavaScript</h2>

              <label>
                Pegar JS aquí
                <textarea
                  name="js_content"
                  value={form.js_content}
                  onChange={handleChange}
                  placeholder="console.log('Plantilla cargada');"
                  rows="10"
                />
              </label>
            </section>

            <section className="admin-card">
              <div className="admin-section-head">
                <div>
                  <h2>9. Campos editables</h2>
                  <p>Estos campos serán el editor propio de esta plantilla.</p>
                </div>

                <button type="button" onClick={addField}>
                  + Agregar campo
                </button>
              </div>

              {fields.map((field, index) => (
                <div className="field-builder" key={index}>
                  <input
                    placeholder="name: titulo"
                    value={field.name}
                    onChange={(e) =>
                      updateField(index, "name", makeFieldName(e.target.value))
                    }
                  />

                  <input
                    placeholder="Label: Título"
                    value={field.label}
                    onChange={(e) =>
                      updateField(index, "label", e.target.value)
                    }
                  />

                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, "type", e.target.value)}
                  >
                    {FIELD_TYPES.map((type) => (
                      <option value={type} key={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  <input
                    placeholder="Valor por defecto"
                    value={field.default}
                    onChange={(e) =>
                      updateField(index, "default", e.target.value)
                    }
                  />

                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    disabled={fields.length <= 1}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </section>
          </>
        )}

        <section className="admin-card">
          <h2>Estado</h2>

          <div className="admin-checks">
            <label>
              <input
                type="checkbox"
                name="is_free"
                checked={form.is_free}
                onChange={handleChange}
              />
              ¿Es gratis?
            </label>

            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
              />
              Plantilla activa
            </label>
          </div>
        </section>

        <div className="admin-actions">
          <button type="button" onClick={() => navigate("/admin/templates")}>
            Cancelar
          </button>

          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar plantilla"}
          </button>
        </div>
      </form>
    </div>
  );
}
