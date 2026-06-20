import { useEffect, useState } from "react";
import {
  deleteAdminUserPage,
  extendAdminUserPage,
  getAdminUserPages,
  restoreAdminUserPage,
} from "../../services/admin/adminService";

export default function AdminUserPages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadPages = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminUserPages();
      setPages(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err.message || "Error al cargar páginas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Sin fecha";

    return new Date(date).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getUserName = (page) => {
    return page.user?.name || page.user_name || "Sin usuario";
  };

  const getUserEmail = (page) => {
    return page.user?.email || page.user_email || "";
  };

  const getTemplateName = (page) => {
    return (
      page.template?.title ||
      page.template?.name ||
      page.template_name ||
      "Sin plantilla"
    );
  };

  const handleRestore = async (pageId) => {
    try {
      setActionLoading(`restore-${pageId}`);
      setMessage("");
      setError("");

      await restoreAdminUserPage(pageId);
      setMessage("Página restaurada correctamente.");
      await loadPages();
    } catch (err) {
      setError(err.message || "Error al restaurar página.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleExtend = async (pageId) => {
    const days = window.prompt("¿Cuántos días quieres extender?", "30");

    if (!days) return;

    const parsedDays = Number(days);

    if (!parsedDays || parsedDays <= 0) {
      setError("Ingresa una cantidad válida de días.");
      return;
    }

    try {
      setActionLoading(`extend-${pageId}`);
      setMessage("");
      setError("");

      await extendAdminUserPage(pageId, parsedDays);
      setMessage(`Página extendida ${parsedDays} días correctamente.`);
      await loadPages();
    } catch (err) {
      setError(err.message || "Error al extender página.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (pageId) => {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar esta página?",
    );

    if (!confirmDelete) return;

    try {
      setActionLoading(`delete-${pageId}`);
      setMessage("");
      setError("");

      await deleteAdminUserPage(pageId);
      setMessage("Página eliminada correctamente.");
      await loadPages();
    } catch (err) {
      setError(err.message || "Error al eliminar página.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <p>Cargando páginas...</p>;
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <h1>📄 Páginas de usuarios</h1>
        <p>
          Administra las páginas creadas por los usuarios. Puedes restaurar,
          extender o eliminar páginas.
        </p>
      </div>

      {message && <div className="admin-success-message">{message}</div>}
      {error && <div className="admin-error-message">{error}</div>}

      <div className="admin-table-card">
        {pages.length === 0 ? (
          <p>No hay páginas creadas todavía.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Plantilla</th>
                  <th>Título</th>
                  <th>Estado</th>
                  <th>Expira</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {pages.map((page) => (
                  <tr key={page.id}>
                    <td>#{page.id}</td>

                    <td>
                      <strong>{getUserName(page)}</strong>
                      <br />
                      <small>{getUserEmail(page)}</small>
                    </td>

                    <td>{getTemplateName(page)}</td>

                    <td>{page.title || "Sin título"}</td>

                    <td>
                      <span
                        className={`admin-status ${page.status || "unknown"}`}
                      >
                        {page.status || "Sin estado"}
                      </span>
                    </td>

                    <td>{formatDate(page.expires_at)}</td>

                    <td>
                      <div className="admin-actions">
                        <button
                          type="button"
                          onClick={() => handleRestore(page.id)}
                          disabled={actionLoading === `restore-${page.id}`}
                        >
                          Restaurar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExtend(page.id)}
                          disabled={actionLoading === `extend-${page.id}`}
                        >
                          Extender
                        </button>

                        <button
                          type="button"
                          className="danger"
                          onClick={() => handleDelete(page.id)}
                          disabled={actionLoading === `delete-${page.id}`}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
