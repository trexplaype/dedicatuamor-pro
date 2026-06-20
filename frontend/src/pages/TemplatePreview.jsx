import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import API_URL from "../services/api";
import { createUserPage } from "../services/userPageService";

function buildUrl(path) {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_URL}${path}`;
}

export default function TemplatePreview() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  const template = location.state?.template;

  const viewUrl = useMemo(() => {
    return buildUrl(
      template?.view_url ||
        template?.viewUrl ||
        template?.index_url ||
        template?.indexUrl ||
        template?.preview_url ||
        template?.previewUrl ||
        template?.preview,
    );
  }, [template]);

  const goBack = () => {
    navigate("/templates");
  };

  const handleCreatePage = async () => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("apiToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setCreating(true);
      setMessage("");

      const data = await createUserPage(
        template.id,
        `Mi página ${template.title || template.name || id}`,
      );

      const editorUrl = buildUrl(
        template.editor_url || template.editorUrl || template.editor,
      );

      if (editorUrl) {
        navigate(
          `/zip-editor?editor=${encodeURIComponent(
            editorUrl,
          )}&page_id=${data.page.id}&template_id=${template.id}`,
        );
        return;
      }

      navigate(`/editor/${data.page.id}`);
    } catch (error) {
      setMessage(error.message || "No se pudo crear la página.");
    } finally {
      setCreating(false);
    }
  };

  if (!template || !viewUrl) {
    return (
      <main className="panel-main">
        <section className="panel-shell">
          <h1>Vista previa no disponible</h1>

          <p>No se encontró la información de la plantilla #{id}.</p>

          <button
            type="button"
            className="button button-secondary"
            onClick={goBack}
          >
            ← Volver a plantillas
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="panel-main">
      <section className="panel-shell zip-editor-shell">
        <div className="zip-editor-top">
          <div>
            <h1>{template.title || template.name || "Vista de plantilla"}</h1>

            <p>Vista previa dentro de DEV AGS.</p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <button
              type="button"
              className="button button-secondary"
              onClick={goBack}
            >
              ← Volver
            </button>

            <button
              type="button"
              className="button button-primary"
              onClick={handleCreatePage}
              disabled={creating}
            >
              {creating ? "Creando..." : "✨ Crear página"}
            </button>
          </div>
        </div>

        {message && (
          <div className="zip-publish-message" style={{ marginBottom: "12px" }}>
            {message}
          </div>
        )}

        <iframe
          src={viewUrl}
          title={template.title || template.name || "Vista previa"}
          className="zip-editor-frame"
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups"
          allow="autoplay; fullscreen"
        />
      </section>
    </main>
  );
}
