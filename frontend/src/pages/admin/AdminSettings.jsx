import { useEffect, useState } from "react";
import API_URL from "../../services/api";

function getToken() {
  return localStorage.getItem("apiToken");
}

export default function AdminSettings() {
  const [form, setForm] = useState({
    reward_ad_30: 10,
    reward_ad_60: 25,
    reward_whatsapp: 15,
    reward_invite_friend: 50,
    default_template_price: 50,
    app_name: "DEV AGS",
    admin_whatsapp: "",
    contact_email: "",
    telegram_url: "",
    support_url: "",
    terms_url: "",
    coins_per_sol: 20,
    ads_enabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadSettings() {
    try {
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al cargar configuración");
      }

      setForm({
        reward_ad_30: data.reward_ad_30 ?? 10,
        reward_ad_60: data.reward_ad_60 ?? 25,
        reward_whatsapp: data.reward_whatsapp ?? 15,
        reward_invite_friend: data.reward_invite_friend ?? 50,
        default_template_price: data.default_template_price ?? 50,
        app_name: data.app_name ?? "DEV AGS",
        admin_whatsapp: data.admin_whatsapp ?? "",
        contact_email: data.contact_email ?? "",
        telegram_url: data.telegram_url ?? "",
        support_url: data.support_url ?? "",
        terms_url: data.terms_url ?? "",
        coins_per_sol: data.coins_per_sol ?? 20,
        ads_enabled: Boolean(data.ads_enabled),
      });
    } catch (error) {
      setMessage(error.message || "Error al cargar configuración");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = {
        reward_ad_30: Number(form.reward_ad_30 || 0),
        reward_ad_60: Number(form.reward_ad_60 || 0),
        reward_whatsapp: Number(form.reward_whatsapp || 0),
        reward_invite_friend: Number(form.reward_invite_friend || 0),
        default_template_price: Number(form.default_template_price || 0),
        app_name: form.app_name,
        admin_whatsapp: form.admin_whatsapp || null,
        contact_email: form.contact_email || null,
        telegram_url: form.telegram_url || null,
        support_url: form.support_url || null,
        terms_url: form.terms_url || null,
        coins_per_sol: Number(form.coins_per_sol || 1),
        ads_enabled: Boolean(form.ads_enabled),
      };

      const response = await fetch(`${API_URL}/api/admin/settings`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al guardar configuración");
      }

      setMessage("✅ Configuración actualizada correctamente.");
    } catch (error) {
      setMessage(error.message || "Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) return <p>Cargando configuración...</p>;

  return (
    <section>
      <div className="admin-page-header">
        <h1>⚙️ Configuración General</h1>
        <p>Gestiona recompensas, monedas, contacto y footer.</p>
      </div>

      {message && <div className="admin-alert">{message}</div>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <section className="admin-card">
          <h2>🪙 Recompensas</h2>

          <div className="admin-grid">
            <label>
              Anuncio 30 segundos
              <input
                type="number"
                name="reward_ad_30"
                value={form.reward_ad_30}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              Anuncio 60 segundos
              <input
                type="number"
                name="reward_ad_60"
                value={form.reward_ad_60}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              Compartir WhatsApp
              <input
                type="number"
                name="reward_whatsapp"
                value={form.reward_whatsapp}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              Invitar amigo
              <input
                type="number"
                name="reward_invite_friend"
                value={form.reward_invite_friend}
                onChange={handleChange}
                min="0"
              />
            </label>
          </div>
        </section>

        <section className="admin-card">
          <h2>💰 Monedas y plantillas</h2>

          <div className="admin-grid">
            <label>
              Precio base plantilla
              <input
                type="number"
                name="default_template_price"
                value={form.default_template_price}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              Monedas por S/ 1
              <input
                type="number"
                name="coins_per_sol"
                value={form.coins_per_sol}
                onChange={handleChange}
                min="1"
              />
            </label>
          </div>
        </section>

        <section className="admin-card">
          <h2>📱 Contacto / Footer</h2>

          <div className="admin-grid">
            <label>
              Nombre de la app
              <input
                name="app_name"
                value={form.app_name}
                onChange={handleChange}
              />
            </label>

            <label>
              WhatsApp admin
              <input
                name="admin_whatsapp"
                value={form.admin_whatsapp}
                onChange={handleChange}
                placeholder="51999999999"
              />
            </label>

            <label>
              Correo de contacto
              <input
                type="email"
                name="contact_email"
                value={form.contact_email}
                onChange={handleChange}
                placeholder="hola@devags.com"
              />
            </label>

            <label>
              Telegram
              <input
                name="telegram_url"
                value={form.telegram_url}
                onChange={handleChange}
                placeholder="https://t.me/usuario"
              />
            </label>

            <label>
              Soporte
              <input
                name="support_url"
                value={form.support_url}
                onChange={handleChange}
                placeholder="https://wa.me/51999999999"
              />
            </label>

            <label>
              Términos
              <input
                name="terms_url"
                value={form.terms_url}
                onChange={handleChange}
                placeholder="/terms"
              />
            </label>
          </div>
        </section>

        <section className="admin-card">
          <h2>📢 Publicidad</h2>

          <div className="admin-checks">
            <label>
              <input
                type="checkbox"
                name="ads_enabled"
                checked={form.ads_enabled}
                onChange={handleChange}
              />
              Anuncios activados
            </label>
          </div>
        </section>

        <div className="admin-actions">
          <button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar configuración"}
          </button>
        </div>
      </form>
    </section>
  );
}
