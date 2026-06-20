import { useEffect, useState } from "react";
import {
  getAdminLinkOptions,
  createAdminLinkOption,
  updateAdminLinkOption,
  deleteAdminLinkOption,
} from "../../services/admin/adminLinkOptionService";

const emptyForm = {
  slug: "",
  label: "",
  plan_level: "free",
  is_active: true,
  sort_order: 0,
};

const plans = ["free", "premium", "vip", "super-user"];

export default function AdminLinkOptions() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setItems(await getAdminLinkOptions());
  }

  function edit(item) {
    setEditingId(item.id);
    setForm({
      slug: item.slug || "",
      label: item.label || "",
      plan_level: item.plan_level || "free",
      is_active: Boolean(item.is_active),
      sort_order: item.sort_order || 0,
    });
  }

  async function save(e) {
    e.preventDefault();

    const payload = {
      ...form,
      sort_order: Number(form.sort_order || 0),
      is_active: Boolean(form.is_active),
    };

    if (editingId) await updateAdminLinkOption(editingId, payload);
    else await createAdminLinkOption(payload);

    setForm(emptyForm);
    setEditingId(null);
    load();
  }

  async function remove(id) {
    if (!window.confirm("¿Eliminar enlace?")) return;
    await deleteAdminLinkOption(id);
    load();
  }

  return (
    <main className="panel-main">
      <section className="panel-shell">
        <h1>Enlaces públicos</h1>

        <div className="admin-grid">
          <form className="dashboard-card editor-card" onSubmit={save}>
            <h2>{editingId ? "Editar enlace" : "Nuevo enlace"}</h2>

            <label className="editor-label">
              Slug
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
              />
            </label>

            <label className="editor-label">
              Texto visible
              <input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                required
              />
            </label>

            <label className="editor-label">
              Plan
              <select
                value={form.plan_level}
                onChange={(e) =>
                  setForm({ ...form, plan_level: e.target.value })
                }
              >
                {plans.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>

            <label className="editor-label">
              Orden
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm({ ...form, sort_order: e.target.value })
                }
              />
            </label>

            <label className="editor-check">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
              />
              Activo
            </label>

            <button className="button button-primary">Guardar</button>
          </form>

          <div className="dashboard-card">
            <h2>Listado</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Slug</th>
                    <th>Texto</th>
                    <th>Plan</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.sort_order}</td>
                      <td>{item.slug}</td>
                      <td>{item.label}</td>
                      <td>{item.plan_level}</td>
                      <td>{item.is_active ? "Activo" : "Oculto"}</td>
                      <td>
                        <button className="mini-btn" onClick={() => edit(item)}>
                          Editar
                        </button>
                        <button
                          className="mini-btn danger"
                          onClick={() => remove(item.id)}
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
        </div>
      </section>
    </main>
  );
}
