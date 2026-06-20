import { useEffect, useState } from "react";
import API_URL from "../services/api";
import {
  deletePageAsset,
  getPageAssets,
  saveExternalPageAsset,
  uploadPageAsset,
} from "../services/userPageAssetService";

const TYPES = [
  { value: "image", label: "📸 Imagen", accept: "image/*" },
  { value: "music", label: "🎵 Música", accept: "audio/*" },
  { value: "video", label: "🎬 Video", accept: "video/*" },
  { value: "audio", label: "🎤 Audio", accept: "audio/*" },
  { value: "file", label: "📁 Archivo", accept: "*" },
];

function getAssetUrl(asset) {
  if (asset.source_type === "url") return asset.url;

  if (!asset.file_path) return "";

  return `${API_URL}/storage/${asset.file_path}`;
}

export default function PageAssetsManager({ pageId }) {
  const [assets, setAssets] = useState([]);
  const [type, setType] = useState("image");
  const [title, setTitle] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("upload");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const selectedType = TYPES.find((item) => item.value === type);

  useEffect(() => {
    if (pageId) {
      loadAssets();
    }
  }, [pageId]);

  async function loadAssets() {
    try {
      setLoading(true);
      const data = await getPageAssets(pageId);
      setAssets(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message || "Error cargando assets");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);

      if (mode === "upload") {
        if (!file) {
          setMessage("Selecciona un archivo.");
          return;
        }

        await uploadPageAsset(pageId, {
          type,
          file,
          title,
        });
      }

      if (mode === "url") {
        if (!externalUrl.trim()) {
          setMessage("Ingresa una URL válida.");
          return;
        }

        await saveExternalPageAsset(pageId, {
          type,
          url: externalUrl.trim(),
          title,
        });
      }

      setTitle("");
      setExternalUrl("");
      setFile(null);

      await loadAssets();

      setMessage("✅ Asset guardado correctamente.");
    } catch (error) {
      setMessage(error.message || "Error guardando asset");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(assetId) {
    const ok = window.confirm("¿Eliminar este asset?");
    if (!ok) return;

    try {
      setLoading(true);
      await deletePageAsset(assetId);
      await loadAssets();
      setMessage("🗑 Asset eliminado.");
    } catch (error) {
      setMessage(error.message || "Error eliminando asset");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-card editor-card">
      <h2>Archivos multimedia</h2>
      <p>Sube imágenes, música, videos, audios o agrega URLs externas.</p>

      {message && <div className="admin-alert">{message}</div>}

      <form onSubmit={handleUpload}>
        <div className="admin-grid">
          <label>
            Tipo
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Modo
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="upload">Subir desde dispositivo</option>
              <option value="url">Usar URL externa</option>
            </select>
          </label>

          <label>
            Título opcional
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Foto principal"
            />
          </label>

          {mode === "upload" ? (
            <label>
              Archivo
              <input
                type="file"
                accept={selectedType?.accept || "*"}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          ) : (
            <label>
              URL externa
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>
          )}
        </div>

        <div className="editor-actions">
          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar "}
          </button>
        </div>
      </form>

      <hr />

      <h3>Assets guardados</h3>

      {assets.length === 0 && <p>No hay assets guardados todavía.</p>}

      <div className="admin-grid">
        {assets.map((asset) => {
          const assetUrl = getAssetUrl(asset);

          return (
            <div key={asset.id} className="dashboard-card">
              <strong>{asset.title || asset.type}</strong>
              <p>
                Tipo: {asset.type}
                <br />
                Origen: {asset.source_type === "url" ? "URL" : "Subido"}
              </p>

              {asset.type === "image" && assetUrl && (
                <img
                  src={assetUrl}
                  alt={asset.title || "asset"}
                  style={{
                    width: "100%",
                    maxHeight: "160px",
                    objectFit: "cover",
                    borderRadius: "12px",
                  }}
                />
              )}

              {(asset.type === "audio" || asset.type === "music") &&
                assetUrl && <audio src={assetUrl} controls />}

              {asset.type === "video" && assetUrl && (
                <video
                  src={assetUrl}
                  controls
                  style={{ width: "100%", borderRadius: "12px" }}
                />
              )}

              {assetUrl && (
                <p>
                  <a href={assetUrl} target="_blank" rel="noreferrer">
                    Abrir archivo
                  </a>
                </p>
              )}

              <button
                type="button"
                className="button button-secondary"
                onClick={() => handleDelete(asset.id)}
                disabled={loading}
              >
                🗑 Eliminar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
