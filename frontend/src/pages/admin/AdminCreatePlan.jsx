import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAdminPlan } from "../../services/admin/planAdminService";

export default function AdminCreatePlan() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    price_type: "coins",
    price_amount: 0,

    duration_value: 30,
    duration_unit: "days",

    page_duration_value: 30,
    page_duration_unit: "days",

    max_pages_per_day: 2,
    max_pages: 0,
    max_storage_mb: 0,

    access_level: "free",
    features_text: "",
    is_active: true,
    monthly_limit: "",
    discount_percent: 0,
    discount_ends_at: "",
    only_new_users: false,

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function makeSlug(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
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
      }

      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        slug: form.slug,

        price_type: form.price_type,
        price_amount: Number(form.price_amount || 0),

        duration_value: Number(form.duration_value || 0),
        duration_unit: form.duration_unit,

        page_duration_value: Number(form.page_duration_value || 1),
        page_duration_unit: form.page_duration_unit,

        max_pages_per_day: Number(form.max_pages_per_day || 0),
        max_pages: Number(form.max_pages || 0),
        max_storage_mb: Number(form.max_storage_mb || 0),

        access_level: form.access_level,

        features: form.features_text
          ? form.features_text
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],

        is_active: Boolean(form.is_active),
        monthly_limit: form.monthly_limit ? Number(form.monthly_limit) : null,
        discount_percent: Number(form.discount_percent || 0),
        discount_ends_at: form.discount_ends_at || null,
        only_new_users: Boolean(form.only_new_users),

        allow_upload_assets: Boolean(form.allow_upload_assets),
        allow_external_assets: Boolean(form.allow_external_assets),
        use_default_assets: Boolean(form.use_default_assets),

        max_upload_images: Number(form.max_upload_images || 0),
        max_upload_music: Number(form.max_upload_music || 0),
        max_upload_videos: Number(form.max_upload_videos || 0),
        max_upload_audios: Number(form.max_upload_audios || 0),
        max_upload_files: Number(form.max_upload_files || 0),

        max_external_images: Number(form.max_external_images || 0),
        max_external_music: Number(form.max_external_music || 0),
        max_external_videos: Number(form.max_external_videos || 0),
        max_external_audios: Number(form.max_external_audios || 0),
        max_external_files: Number(form.max_external_files || 0),
      };

      await createAdminPlan(payload);

      alert("Plan creado correctamente");
      navigate("/admin/plans");
    } catch (err) {
      setError(err.message || "Error al crear plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="admin-page-header">
        <h1>➕ Crear Plan</h1>
        <p>Crea planes como Premium, VIP o Super User.</p>
      </div>

      {error && <div className="admin-alert error">⚠️ {error}</div>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <section className="admin-card">
          <h2>Información del plan</h2>

          <div className="admin-grid">
            <label>
              Nombre
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="SUPER USER"
                required
              />
            </label>

            <label>
              Slug generado automáticamente
              <input value={form.slug} readOnly disabled />
            </label>

            <label>
              Tipo de precio
              <select
                name="price_type"
                value={form.price_type}
                onChange={handleChange}
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
                name="price_amount"
                value={form.price_amount}
                onChange={handleChange}
                min="0"
                step="1"
              />
            </label>

            <label>
              Duración del plan
              <input
                type="number"
                name="duration_value"
                value={form.duration_value}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              Unidad duración plan
              <select
                name="duration_unit"
                value={form.duration_unit}
                onChange={handleChange}
              >
                <option value="hours">Horas</option>
                <option value="days">Días</option>
              </select>
            </label>

            <label>
              Duración de cada página
              <input
                type="number"
                name="page_duration_value"
                value={form.page_duration_value}
                onChange={handleChange}
                min="1"
              />
            </label>

            <label>
              Unidad duración página
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
              Máximo páginas por día
              <input
                type="number"
                name="max_pages_per_day"
                value={form.max_pages_per_day}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              Nivel de acceso
              <select
                name="access_level"
                value={form.access_level}
                onChange={handleChange}
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="vip">VIP</option>
                <option value="exclusive">Super User / Exclusive</option>
                <option value="super-user">Super User</option>
              </select>
            </label>

            <label>
              Páginas activas
              <input
                type="number"
                name="max_pages"
                value={form.max_pages}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              Almacenamiento MB
              <input
                type="number"
                name="max_storage_mb"
                value={form.max_storage_mb}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              Límite mensual
              <input
                type="number"
                name="monthly_limit"
                value={form.monthly_limit}
                onChange={handleChange}
                placeholder="Opcional"
                min="1"
              />
            </label>

            <label>
              Descuento %
              <input
                type="number"
                name="discount_percent"
                value={form.discount_percent}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </label>

            <label>
              Fin descuento
              <input
                type="datetime-local"
                name="discount_ends_at"
                value={form.discount_ends_at}
                onChange={handleChange}
              />
            </label>
          </div>
        </section>

        <section className="admin-card">
          <h2>Permisos de assets</h2>

          <div className="admin-checks">
            <label>
              <input
                type="checkbox"
                name="use_default_assets"
                checked={form.use_default_assets}
                onChange={handleChange}
              />
              Usar assets por defecto
            </label>

            <label>
              <input
                type="checkbox"
                name="allow_upload_assets"
                checked={form.allow_upload_assets}
                onChange={handleChange}
              />
              Permitir subida directa
            </label>

            <label>
              <input
                type="checkbox"
                name="allow_external_assets"
                checked={form.allow_external_assets}
                onChange={handleChange}
              />
              Permitir URLs externas
            </label>
          </div>

          <h3>Subida directa</h3>

          <div className="admin-grid">
            <label>
              Fotos directas
              <input
                type="number"
                name="max_upload_images"
                value={form.max_upload_images}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              Músicas directas
              <input
                type="number"
                name="max_upload_music"
                value={form.max_upload_music}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              Videos directos
              <input
                type="number"
                name="max_upload_videos"
                value={form.max_upload_videos}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              Audios directos
              <input
                type="number"
                name="max_upload_audios"
                value={form.max_upload_audios}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              Archivos directos
              <input
                type="number"
                name="max_upload_files"
                value={form.max_upload_files}
                onChange={handleChange}
                min="0"
              />
            </label>
          </div>

          <h3>URLs externas</h3>

          <div className="admin-grid">
            <label>
              Fotos por URL
              <input
                type="number"
                name="max_external_images"
                value={form.max_external_images}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              Músicas por URL
              <input
                type="number"
                name="max_external_music"
                value={form.max_external_music}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              Videos por URL
              <input
                type="number"
                name="max_external_videos"
                value={form.max_external_videos}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              Audios por URL
              <input
                type="number"
                name="max_external_audios"
                value={form.max_external_audios}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              Archivos por URL
              <input
                type="number"
                name="max_external_files"
                value={form.max_external_files}
                onChange={handleChange}
                min="0"
              />
            </label>
          </div>
        </section>

        <section className="admin-card">
          <h2>Beneficios</h2>

          <label>
            Beneficios del plan
            <textarea
              name="features_text"
              rows="10"
              value={form.features_text}
              onChange={handleChange}
              placeholder={`Acceso a plantillas Premium
Música personalizada por URL
Fotos externas configurables
Duración de cada página: 30 días`}
            />
          </label>

          <div className="admin-checks">
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
              />
              Activo
            </label>

            <label>
              <input
                type="checkbox"
                name="only_new_users"
                checked={form.only_new_users}
                onChange={handleChange}
              />
              Solo nuevos usuarios
            </label>
          </div>
        </section>

        <div className="admin-actions">
          <button type="button" onClick={() => navigate("/admin/plans")}>
            Cancelar
          </button>

          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Plan"}
          </button>
        </div>
      </form>
    </section>
  );
}
