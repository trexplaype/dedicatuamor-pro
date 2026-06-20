import { useEffect, useState } from "react";
import {
  createTemplateCategory,
  deleteTemplateCategory,
  getTemplateCategories,
  updateTemplateCategory,
} from "../../services/categoryService";

const emptyForm = {
  name: "",
  description: "",
  icon: "",
  image: "",
  sort_order: 0,
  is_active: true,
};

export default function AdminTemplateCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await getTemplateCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      alert(error.message || "Error cargando categorías");
    } finally {
      setLoading(false);
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function editCategory(category) {
    setEditingId(category.id);

    setForm({
      name: category.name || "",
      description: category.description || "",
      icon: category.icon || "",
      image: category.image || "",
      sort_order: category.sort_order || 0,
      is_active: Boolean(category.is_active),
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        name: form.name,
        description: form.description,
        icon: form.icon,
        image: form.image,
        sort_order: Number(form.sort_order || 0),
        is_active: Boolean(form.is_active),
      };

      if (editingId) {
        await updateTemplateCategory(editingId, payload);
        alert("Categoría actualizada");
      } else {
        await createTemplateCategory(payload);
        alert("Categoría creada");
      }

      resetForm();
      await loadCategories();
    } catch (error) {
      alert(error.message || "Error guardando categoría");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar esta categoría?")) return;

    try {
      await deleteTemplateCategory(id);
      await loadCategories();
    } catch (error) {
      alert(error.message || "Error eliminando categoría");
    }
  }

  return (
    <main className="panel-main">
      <section className="panel-shell">
        <div className="panel-top">
          <div>
            <h1>Categorías de plantillas</h1>
            <p>Administra las categorías visibles en DEV AGS.</p>
          </div>
        </div>

        <div className="admin-grid">
          <form className="dashboard-card editor-card" onSubmit={handleSubmit}>
            <h2>{editingId ? "Editar categoría" : "Nueva categoría"}</h2>

            <label className="editor-label">
              Nombre
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Ej: Amor"
                required
              />
            </label>

            <label className="editor-label">
              Descripción
              <input
                type="text"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Ej: Para tu persona especial"
              />
            </label>

            <label className="editor-label">
              Icono
              <input
                type="text"
                value={form.icon}
                onChange={(e) => updateField("icon", e.target.value)}
                placeholder="heart, calendar, cake, ring..."
              />
            </label>

            <label className="editor-label">
              Imagen
              <input
                type="text"
                value={form.image}
                onChange={(e) => updateField("image", e.target.value)}
                placeholder="/design/icons/heart.png"
              />
            </label>

            <label className="editor-label">
              Orden
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => updateField("sort_order", e.target.value)}
              />
            </label>

            <label className="editor-check">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => updateField("is_active", e.target.checked)}
              />
              Activa
            </label>

            <div className="editor-actions">
              <button
                type="submit"
                className="button button-primary"
                disabled={saving}
              >
                {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="dashboard-card">
            <h2>Listado</h2>

            {loading ? (
              <p>Cargando categorías...</p>
            ) : categories.length === 0 ? (
              <p>No hay categorías creadas.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Orden</th>
                      <th>Nombre</th>
                      <th>Slug</th>
                      <th>Icono</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td>{category.sort_order}</td>
                        <td>{category.name}</td>
                        <td>{category.slug}</td>
                        <td>{category.icon || "-"}</td>
                        <td>{category.is_active ? "Activo" : "Oculto"}</td>
                        <td>
                          <button
                            type="button"
                            className="mini-btn"
                            onClick={() => editCategory(category)}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className="mini-btn danger"
                            onClick={() => handleDelete(category.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
