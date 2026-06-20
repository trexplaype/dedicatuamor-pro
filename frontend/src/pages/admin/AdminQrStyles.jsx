import { useEffect, useState } from "react";
import {
  getAdminQrStyles,
  createAdminQrStyle,
  updateAdminQrStyle,
  deleteAdminQrStyle,
} from "../../services/admin/adminQrStyleService";

const emptyForm = {
  name: "",
  slug: "",
  plan_level: "free",
  primary_color: "#000000",
  secondary_color: "#ffffff",
  shape: "square",
  logo_enabled: false,
  is_active: true,
  sort_order: 0,
  preview_image: "",
};

const plans = ["free", "premium", "vip", "super-user"];
const shapes = ["square", "rounded", "heart", "luxury"];

export default function AdminQrStyles() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setItems(await getAdminQrStyles());
  }

  function edit(item) {
    setEditingId(item.id);
    setForm({ ...emptyForm, ...item });
  }

  async function save(e) {
    e.preventDefault();

    const payload = {
      ...form,
      sort_order: Number(form.sort_order || 0),
      logo_enabled: Boolean(form.logo_enabled),
      is_active: Boolean(form.is_active),
    };

    if (editingId) await updateAdminQrStyle(editingId, payload);
    else await createAdminQrStyle(payload);

    setForm(emptyForm);
    setEditingId(null);
    load();
  }

  async function remove(id) {
    if (!window.confirm("¿Eliminar estilo QR?")) return;
    await deleteAdminQrStyle(id);
    load();
  }

  return (
    <main className="panel-main">
      <section className="panel-shell">
        <h1>Diseños QR</h1>

        <div className="admin-grid">
          <form className="dashboard-card editor-card" onSubmit={save}>
            <h2>{editingId ? "Editar QR" : "Nuevo QR"}</h2>

            {[
              "name",
              "slug",
              "primary_color",
              "secondary_color",
              "preview_image",
            ].map((field) => (
              <label className="editor-label" key={field}>
                {field}
                <input
                  value={form[field] || ""}
                  onChange={(e) =>
                    setForm({ ...form, [field]: e.target.value })
                  }
                  required={field === "name" || field === "slug"}
                />
              </label>
            ))}

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
              Forma
              <select
                value={form.shape}
                onChange={(e) => setForm({ ...form, shape: e.target.value })}
              >
                {shapes.map((s) => (
                  <option key={s}>{s}</option>
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
                checked={form.logo_enabled}
                onChange={(e) =>
                  setForm({ ...form, logo_enabled: e.target.checked })
                }
              />
              Logo
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
                    <th>Nombre</th>
                    <th>Plan</th>
                    <th>Forma</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.sort_order}</td>
                      <td>{item.name}</td>
                      <td>{item.plan_level}</td>
                      <td>{item.shape}</td>
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
