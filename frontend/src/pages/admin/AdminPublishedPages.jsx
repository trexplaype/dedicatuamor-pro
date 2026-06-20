import { useEffect, useState } from "react";
import {
  getAdminPublishedPages,
  updateAdminPublishedPage,
  deleteAdminPublishedPage,
} from "../../services/admin/adminPublishedPageService";

export default function AdminPublishedPages() {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setPages(await getAdminPublishedPages());
  }

  async function expire(page) {
    await updateAdminPublishedPage(page.id, { status: "expired" });
    load();
  }

  async function remove(id) {
    if (!window.confirm("¿Eliminar página publicada?")) return;
    await deleteAdminPublishedPage(id);
    load();
  }

  return (
    <main className="panel-main">
      <section className="panel-shell">
        <h1>Páginas publicadas</h1>

        <div className="dashboard-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Título</th>
                  <th>URL</th>
                  <th>Estado</th>
                  <th>Vence</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id}>
                    <td>{page.id}</td>
                    <td>{page.user?.name || page.user_id}</td>
                    <td>{page.title}</td>
                    <td>
                      {page.public_url ? (
                        <a
                          href={page.public_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Abrir
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{page.status}</td>
                    <td>{page.expires_at || "-"}</td>
                    <td>
                      <button className="mini-btn" onClick={() => expire(page)}>
                        Expirar
                      </button>
                      <button
                        className="mini-btn danger"
                        onClick={() => remove(page.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
