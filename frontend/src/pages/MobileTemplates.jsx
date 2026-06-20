import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API_URL, { request } from "../services/api";
import { createPageFromTemplate } from "../services/userPageService";

function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function MobileTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [limitModal, setLimitModal] = useState(null);
  const [creating, setCreating] = useState(false);
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search") || "";

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      setLoading(true);
      const data = await request("/api/templates");
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando plantillas:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTemplate() {
    if (!selectedTemplate) return;

    try {
      setCreating(true);

      const data = await createPageFromTemplate(
        selectedTemplate.id,
        selectedTemplate.title || selectedTemplate.name || "Mi página especial",
      );

      setSelectedTemplate(null);

      if (data?.page?.id) {
        navigate(`/editor/${data.page.id}`);
        return;
      }

      if (data?.id) {
        navigate(`/editor/${data.id}`);
        return;
      }

      navigate("/my-pages");
    } catch (error) {
      setSelectedTemplate(null);

      setLimitModal({
        title: "No se pudo crear",
        message:
          error.message ||
          "No se pudo crear la página. Revisa tu plan o monedas disponibles.",
      });
    } finally {
      setCreating(false);
    }
  }

  function handlePreviewTemplate() {
    if (!selectedTemplate) return;

    const slug = selectedTemplate.slug;

    if (slug) {
      window.open(`${API_URL}/api/p/${slug}`, "_blank");
    }

    setSelectedTemplate(null);
  }

  const filteredTemplates = useMemo(() => {
    const value = normalizeText(search.trim());

    if (!value) return templates;

    return templates.filter((template) => {
      const searchable = normalizeText(
        [
          template.title,
          template.name,
          template.category,
          template.slug,
          template.description,
        ].join(" "),
      );

      return searchable.includes(value);
    });
  }, [templates, search]);

  return (
    <div className="mobile-page">
      <div className="mobile-page-header">
        <h1>💗 Plantillas</h1>
        <p>
          {search
            ? `Resultados para: "${search}"`
            : "Explora plantillas para tus dedicatorias."}
        </p>
      </div>

      {loading && <p>Cargando plantillas...</p>}

      {!loading && filteredTemplates.length === 0 && (
        <p className="mobile-empty">No se encontraron plantillas.</p>
      )}

      <div className="mobile-template-grid">
        {filteredTemplates.map((template) => (
          <article
            key={template.id}
            className="mobile-template-card"
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="mobile-template-image">
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

            <div className="mobile-template-info">
              <span>{template.category || "romance"}</span>
              <strong>
                {template.is_free ? "Gratis" : `${template.price_coins} 🪙`}
              </strong>
            </div>
          </article>
        ))}
      </div>

      {selectedTemplate && (
        <div className="mobile-modal-backdrop">
          <div className="mobile-template-modal">
            <button
              type="button"
              className="mobile-modal-close"
              onClick={() => setSelectedTemplate(null)}
            >
              ✕
            </button>

            <div className="mobile-modal-icon">💗</div>

            <h2>{selectedTemplate.title || selectedTemplate.name}</h2>
            <p>Elige una acción para esta plantilla.</p>

            <button
              type="button"
              className="mobile-modal-primary"
              onClick={handleCreateTemplate}
              disabled={creating}
            >
              {creating ? "Creando..." : "✨ Crear plantilla"}
            </button>

            <button
              type="button"
              className="mobile-modal-secondary"
              onClick={handlePreviewTemplate}
            >
              👁 Ver plantilla
            </button>
          </div>
        </div>
      )}

      {limitModal && (
        <div className="mobile-modal-backdrop">
          <div className="mobile-limit-modal">
            <div className="mobile-modal-icon">!</div>

            <h2>{limitModal.title}</h2>
            <p>{limitModal.message}</p>

            <div className="mobile-limit-actions">
              <button type="button" onClick={() => navigate("/wallet")}>
                🪙 Recargar monedas
              </button>

              <button type="button" onClick={() => navigate("/plans")}>
                ✨ Suscribirme
              </button>

              <button type="button" onClick={() => navigate("/rewards")}>
                🎁 Ganar monedas
              </button>
            </div>

            <button
              type="button"
              className="mobile-modal-secondary"
              onClick={() => setLimitModal(null)}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
