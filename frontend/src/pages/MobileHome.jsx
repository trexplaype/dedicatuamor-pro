import { useEffect, useMemo, useState } from "react";
import API_URL, { request } from "../services/api";

export default function MobileHome() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      setLoading(true);
      const data = await request("/api/templates");
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando inicio móvil:", error);
    } finally {
      setLoading(false);
    }
  }

  const featured = useMemo(() => templates.slice(0, 6), [templates]);
  const newest = useMemo(
    () => [...templates].reverse().slice(0, 6),
    [templates],
  );
  const premium = useMemo(
    () =>
      templates
        .filter(
          (item) => item.category === "premium" || item.category === "vip",
        )
        .slice(0, 6),
    [templates],
  );

  const renderSection = (title, items) => (
    <section className="mobile-home-section">
      <h2>{title}</h2>

      <div className="mobile-home-row">
        {items.map((template) => (
          <article key={template.id} className="mobile-home-card">
            <div className="mobile-home-image">
              {template.image ? (
                <img
                  src={`${API_URL}/storage/${template.image}`}
                  alt={template.title || template.name}
                />
              ) : (
                <span>{template.symbol || "💌"}</span>
              )}
            </div>

            <h3>{template.title || template.name}</h3>

            <p>{template.is_free ? "Gratis" : `${template.price_coins} 🪙`}</p>
          </article>
        ))}
      </div>
    </section>
  );

  return (
    <div className="mobile-page">
      <div className="mobile-home-hero">
        <h1>💗 DEV AGS</h1>
        <p>Crea dedicatorias únicas con fotos, música y mensajes especiales.</p>
      </div>

      {loading && <p>Cargando plantillas...</p>}

      {!loading && (
        <>
          {renderSection("🔥 Destacadas", featured)}
          {renderSection("🆕 Nuevas plantillas", newest)}
          {premium.length > 0 && renderSection("⭐ Premium y VIP", premium)}
        </>
      )}
    </div>
  );
}
