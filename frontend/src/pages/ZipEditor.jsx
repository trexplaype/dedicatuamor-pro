import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Button from "../components/Button";
import { uploadPageAsset } from "../services/userPageAssetService";
import {
  checkPageSlug,
  getAvailableLinks,
  getAvailableQrStyles,
  publishPage,
} from "../services/pagePublishService";
import { getPagePermissions } from "../services/pagePermissionService";
import { updatePage } from "../services/userPageService";

export default function ZipEditor() {
  const [params] = useSearchParams();

  const editorUrl = params.get("editor");
  const pageId = params.get("page_id");
  const templateId = params.get("template_id");

  const [links, setLinks] = useState([]);
  const [qrStyles, setQrStyles] = useState([]);

  const [customLinkAllowed, setCustomLinkAllowed] = useState(false);
  const [customQrAllowed, setCustomQrAllowed] = useState(false);

  const [useCustomSlug, setUseCustomSlug] = useState(false);
  const [customSlugBase, setCustomSlugBase] = useState("");
  const [slugSuffix, setSlugSuffix] = useState("");

  const [linkOptionId, setLinkOptionId] = useState("");
  const [qrStyleId, setQrStyleId] = useState("");

  const [publicUrl, setPublicUrl] = useState("");
  const [message, setMessage] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [permissions, setPermissions] = useState(null);
  const isPublishedPage = Boolean(
    permissions?.page?.is_published &&
    permissions?.page?.slug &&
    permissions?.page?.public_url,
  );

  const [slugStatus, setSlugStatus] = useState(null);
  const [slugSuggestions, setSlugSuggestions] = useState([]);

  useEffect(() => {
    if (!pageId) return;

    async function loadPublishOptions() {
      try {
        const [linksData, qrData, permissionsData] = await Promise.all([
          getAvailableLinks(pageId),
          getAvailableQrStyles(pageId),
          getPagePermissions(pageId),
        ]);

        const linkItems = Array.isArray(linksData?.links)
          ? linksData.links
          : [];

        const qrItems = Array.isArray(qrData?.styles) ? qrData.styles : [];

        setLinks(linkItems);
        setQrStyles(qrItems);

        setCustomLinkAllowed(Boolean(linksData?.custom_link));
        setCustomQrAllowed(Boolean(qrData?.custom_qr));
        setPermissions(permissionsData);
        if (permissionsData?.page?.public_url) {
          setPublicUrl(permissionsData.page.public_url);
        }

        if (linkItems.length > 0) {
          setLinkOptionId(String(linkItems[0].id));
        }

        if (qrItems.length > 0) {
          setQrStyleId(String(qrItems[0].id));
        }
      } catch (error) {
        setMessage(error.message || "No se pudieron cargar las opciones.");
      }
    }

    loadPublishOptions();
  }, [pageId]);

  useEffect(() => {
    if (!permissions) return;

    const iframe = document.querySelector(".zip-editor-frame");

    if (!iframe) return;

    function sendDataToEditor() {
      if (!iframe.contentWindow) return;

      const savedData = permissions.saved_data || {};

      const payloads = [
        {
          type: "DEDICATUAMOR_PERMISSIONS",
          payload: permissions,
        },
        {
          type: "templateData",
          data: savedData,
        },
        {
          type: "DEDICATUAMOR_LOAD_DATA",
          payload: savedData,
        },
      ];

      const sendAll = () => {
        if (!iframe.contentWindow) return;

        payloads.forEach((payload) => {
          iframe.contentWindow.postMessage(payload, "*");
        });
      };

      sendAll();

      setTimeout(sendAll, 500);
      setTimeout(sendAll, 1500);
      setTimeout(sendAll, 3000);
    }

    iframe.addEventListener("load", sendDataToEditor);

    sendDataToEditor();

    return () => {
      iframe.removeEventListener("load", sendDataToEditor);
    };
  }, [permissions]);

  const selectedLink = useMemo(
    () => links.find((link) => String(link.id) === String(linkOptionId)),
    [links, linkOptionId],
  );

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  const previewBase = useCustomSlug
    ? slugify(customSlugBase)
    : slugify(selectedLink?.slug || "");

  const previewSuffix = slugify(slugSuffix);

  const previewFinalSlug =
    previewBase && previewSuffix
      ? `${previewBase}-${previewSuffix}`
      : previewBase;

  const previewUrl = previewFinalSlug
    ? `${window.location.origin}/${previewFinalSlug}`
    : "";

  useEffect(() => {
    if (!pageId || !previewFinalSlug || !previewSuffix) {
      setSlugStatus(null);
      setSlugSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await checkPageSlug(previewFinalSlug, pageId);

        setSlugStatus(data);
        setSlugSuggestions(
          Array.isArray(data?.suggestions) ? data.suggestions : [],
        );
      } catch (error) {
        setSlugStatus({
          available: false,
          message: error.message || "No se pudo validar el enlace.",
        });
        setSlugSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [previewFinalSlug, previewSuffix, pageId]);

  async function uploadEmbeddedFilesFromData(data) {
    const clean = { ...(data || {}) };

    for (const key of Object.keys(clean)) {
      const value = clean[key];

      if (typeof value !== "string") continue;

      if (!value.startsWith("data:")) continue;

      const match = value.match(/^data:(.*?);base64,(.*)$/);

      if (!match) {
        clean[key] = "";
        continue;
      }

      const mimeType = match[1];
      const base64 = match[2];

      const byteCharacters = atob(base64);

      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const blob = new Blob([new Uint8Array(byteNumbers)], {
        type: mimeType,
      });

      const type = mimeType.startsWith("audio/")
        ? "music"
        : mimeType.startsWith("video/")
          ? "video"
          : mimeType.startsWith("image/")
            ? "image"
            : "file";

      const extension = mimeType.split("/")[1] || "bin";

      const file = new File([blob], `${key}.${extension}`, {
        type: mimeType,
      });

      const asset = await uploadPageAsset(pageId, file, type);

      const uploadedUrl =
        asset?.url ||
        asset?.asset?.url ||
        asset?.asset?.full_url ||
        asset?.full_url ||
        "";

      clean[key] = uploadedUrl;

      if (type === "music" || type === "audio") {
        clean.musica = uploadedUrl;
        clean.audio = uploadedUrl;
        clean.music = uploadedUrl;
      }
    }

    return clean;
  }

  function requestEditorExport() {
    return new Promise((resolve, reject) => {
      const iframe = document.querySelector(".zip-editor-frame");

      if (!iframe || !iframe.contentWindow) {
        reject(new Error("No se encontró el editor de la plantilla."));
        return;
      }

      const timeout = setTimeout(() => {
        window.removeEventListener("message", handleMessage);
        reject(
          new Error(
            "El editor no respondió. Verifica que la plantilla tenga el bridge instalado.",
          ),
        );
      }, 6000);

      function handleMessage(event) {
        if (event.data?.type !== "DEDICATUAMOR_EXPORT_RESULT") return;

        clearTimeout(timeout);
        window.removeEventListener("message", handleMessage);
        resolve(event.data.payload || {});
      }

      window.addEventListener("message", handleMessage);

      iframe.contentWindow.postMessage(
        {
          type: "DEDICATUAMOR_EXPORT",
        },
        "*",
      );
    });
  }

  if (!editorUrl) {
    return (
      <main className="panel-main">
        <section className="panel-shell">
          <h1>Editor no encontrado</h1>
          <p>No se encontró la URL del editor de esta plantilla.</p>
          <Button to="/templates">Volver a plantillas</Button>
        </section>
      </main>
    );
  }

  const finalEditorUrl = `${editorUrl}${
    editorUrl.includes("?") ? "&" : "?"
  }page_id=${pageId || ""}&template_id=${templateId || ""}`;

  async function handlePublish() {
    if (!pageId) {
      setMessage("No se encontró la página.");
      return;
    }

    if (isPublishedPage) {
      try {
        setPublishing(true);
        setMessage("Actualizando contenido...");

        const exported = await requestEditorExport();

        if (!exported?.html) {
          throw new Error("No se pudo obtener el HTML final.");
        }

        const cleanData = await uploadEmbeddedFilesFromData(
          exported.data || {},
        );

        await updatePage(pageId, {
          content: null,
          data_json: cleanData,
          is_published: true,
        });
        setPublicUrl(permissions?.page?.public_url || "");
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        setMessage("Contenido actualizado correctamente.");
      } catch (error) {
        setMessage(error.message || "No se pudo actualizar.");
      } finally {
        setPublishing(false);
      }

      return;
    }

    if (useCustomSlug && !customSlugBase.trim()) {
      setMessage("Escribe la frase base personalizada.");
      return;
    }

    if (!useCustomSlug && !linkOptionId) {
      setMessage("Selecciona una frase del sistema.");
      return;
    }

    if (!slugSuffix.trim()) {
      setMessage("Debes escribir una palabra final para completar tu enlace.");
      return;
    }

    if (slugStatus && slugStatus.available === false) {
      setMessage(
        "El enlace no está disponible. Elige una sugerencia o cambia la palabra final.",
      );
      return;
    }

    try {
      setPublishing(true);
      setMessage("Guardando cambios del editor...");

      const exported = await requestEditorExport();

      if (!exported?.html) {
        throw new Error("No se pudo obtener el HTML final del editor.");
      }

      const cleanData = await uploadEmbeddedFilesFromData(exported.data || {});

      await updatePage(pageId, {
        content: null,
        data_json: cleanData,
        is_published: true,
      });

      setMessage("Publicando página...");

      const data = await publishPage(pageId, {
        custom_slug_base: useCustomSlug ? customSlugBase.trim() : null,
        slug_suffix: slugSuffix.trim(),
        link_option_id: useCustomSlug ? null : linkOptionId || null,
        qr_style_id: qrStyleId || null,
      });

      setPublicUrl(data.public_url || data.page?.public_url || "");
      setMessage("Página guardada y publicada correctamente.");
    } catch (error) {
      setMessage(error.message || "No se pudo publicar la página.");
    } finally {
      setPublishing(false);
    }
  }

  async function copyPublicUrl() {
    if (!publicUrl) return;

    await navigator.clipboard.writeText(publicUrl);
    setMessage("Enlace copiado.");
  }

  function applySuggestion(suggestion) {
    if (!suggestion) return;

    const base = previewBase;

    if (base && suggestion.startsWith(`${base}-`)) {
      setSlugSuffix(suggestion.replace(`${base}-`, ""));
    } else {
      setSlugSuffix(suggestion);
    }

    setMessage("");
  }

  return (
    <main className="panel-main">
      <section className="panel-shell zip-editor-shell">
        <div className="zip-editor-top">
          <div>
            <h1>Editor de plantilla</h1>
            <p>
              Edita tu dedicatoria usando el editor original de esta plantilla.
            </p>
          </div>

          <Button to="/my-pages" variant="secondary">
            Mis páginas
          </Button>
        </div>

        <div className="zip-editor-notice">
          <strong>Editor interno de la plantilla</strong>
          <p>
            Esta plantilla usa su propio editor. Las opciones multimedia,
            descarga HTML y cambios avanzados dependerán de tu compra o
            suscripción.
          </p>
        </div>

        {permissions && (
          <div className="zip-permissions-box">
            <strong>Permisos activos</strong>

            <p>
              Acceso: <b>{permissions.source}</b> | Nivel:{" "}
              <b>{permissions.level}</b>
            </p>

            <div className="zip-permissions-grid">
              <span>
                🎵 Música URL:
                {permissions.external?.music ? " Permitido" : " No permitido"}
              </span>

              <span>
                🎵 Subir MP3:
                {permissions.upload?.music ? " Permitido" : " No permitido"}
              </span>

              <span>
                🖼️ Imagen URL:
                {permissions.external?.image ? " Permitido" : " No permitido"}
              </span>

              <span>
                🖼️ Subir imagen:
                {permissions.upload?.image ? " Permitido" : " No permitido"}
              </span>

              <span>
                📥 Descargar HTML:
                {permissions.can_download_html
                  ? " Permitido"
                  : " Solo administrador"}
              </span>
            </div>
          </div>
        )}

        <iframe
          src={finalEditorUrl}
          title="Editor de plantilla"
          className="zip-editor-frame"
        />

        {pageId && isPublishedPage && (
          <div className="zip-publish-box">
            <div className="zip-publish-header">
              <div>
                <h2>Actualizar publicación</h2>
                <p>
                  Esta página ya fue publicada. El enlace y el QR ya no pueden
                  modificarse.
                </p>
              </div>
            </div>

            <div className="zip-preview-url">
              <span>Enlace publicado:</span>
              <strong>{permissions?.page?.public_url}</strong>
            </div>

            <div className="zip-publish-actions">
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing ? "Actualizando..." : "Actualizar publicación"}
              </button>

              {permissions?.page?.public_url && (
                <>
                  <button type="button" onClick={copyPublicUrl}>
                    Copiar enlace
                  </button>

                  <a
                    href={permissions.page.public_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver página
                  </a>
                </>
              )}
            </div>

            {message && <p className="zip-publish-message">{message}</p>}
          </div>
        )}

        {pageId && !isPublishedPage && (
          <div className="zip-publish-box">
            <div className="zip-publish-header">
              <div>
                <h2>Publicar dedicatoria</h2>
                <p>
                  Cuando termines de editar, completa el enlace público y
                  publica tu página.
                </p>
              </div>
            </div>

            <div className="zip-publish-grid">
              <label>
                Tipo de enlace
                <select
                  value={useCustomSlug ? "custom" : "defined"}
                  onChange={(event) => {
                    setUseCustomSlug(event.target.value === "custom");
                    setSlugStatus(null);
                    setSlugSuggestions([]);
                    setMessage("");
                  }}
                >
                  <option value="defined">Usar frase del sistema</option>

                  {customLinkAllowed && (
                    <option value="custom">Crear mi propia frase</option>
                  )}
                </select>
              </label>

              {!useCustomSlug && (
                <label>
                  Frase del enlace
                  <select
                    value={linkOptionId}
                    onChange={(event) => {
                      setLinkOptionId(event.target.value);
                      setSlugStatus(null);
                      setSlugSuggestions([]);
                    }}
                    disabled={links.length === 0}
                  >
                    {links.map((link) => (
                      <option key={link.id} value={link.id}>
                        {link.label || link.slug}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {useCustomSlug && (
                <label>
                  Frase base personalizada
                  <input
                    type="text"
                    value={customSlugBase}
                    onChange={(event) => {
                      setCustomSlugBase(event.target.value);
                      setSlugStatus(null);
                      setSlugSuggestions([]);
                    }}
                    placeholder="te-amo-mucho"
                  />
                </label>
              )}

              <label>
                Palabra final
                <input
                  type="text"
                  value={slugSuffix}
                  onChange={(event) => {
                    setSlugSuffix(event.target.value);
                    setSlugStatus(null);
                    setSlugSuggestions([]);
                  }}
                  placeholder="Kevin"
                />
              </label>

              <label>
                Diseño QR
                <select
                  value={qrStyleId}
                  onChange={(event) => setQrStyleId(event.target.value)}
                  disabled={qrStyles.length === 0 || !customQrAllowed}
                >
                  {qrStyles.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {previewUrl && (
              <div className="zip-preview-url">
                <span>Vista previa:</span>
                <strong>{previewUrl}</strong>
              </div>
            )}

            {slugStatus && (
              <div className="zip-slug-status">
                <p
                  className={
                    slugStatus.available ? "status-success" : "status-danger"
                  }
                >
                  {slugStatus.available ? "✅ " : "❌ "}
                  {slugStatus.message}
                </p>

                {!slugStatus.available && slugSuggestions.length > 0 && (
                  <div className="zip-slug-suggestions">
                    <strong>Sugerencias disponibles:</strong>

                    <div className="zip-slug-suggestion-list">
                      {slugSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          className="button button-secondary"
                          onClick={() => applySuggestion(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="zip-publish-actions">
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing || slugStatus?.available === false}
              >
                {publishing ? "Publicando..." : "Guardar y publicar"}
              </button>

              {publicUrl && (
                <>
                  <button type="button" onClick={copyPublicUrl}>
                    Copiar enlace
                  </button>

                  <a href={publicUrl} target="_blank" rel="noreferrer">
                    Ver página
                  </a>
                </>
              )}
            </div>

            {message && <p className="zip-publish-message">{message}</p>}
          </div>
        )}
      </section>
    </main>
  );
}
