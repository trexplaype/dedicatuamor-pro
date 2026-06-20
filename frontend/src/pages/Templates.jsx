import { useEffect, useState } from "react";
import TemplateCard from "../components/TemplateCard";
import API_URL from "../services/api";
import { getUserPages } from "../services/userPageService";

export default function Templates() {
  const [search, setSearch] = useState("");
  const [templates, setTemplates] = useState([]);
  const [purchasedTemplates, setPurchasedTemplates] = useState([]);
  const [userPages, setUserPages] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const getToken = () =>
    localStorage.getItem("apiToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("access_token");

  const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.templates)) return data.templates;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const loadTemplates = async () => {
    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/api/templates`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();
      setTemplates(normalizeList(data));
    } catch (error) {
      console.error("Error cargando plantillas:", error);
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadUserTemplateStatus = async () => {
    const token = getToken();

    if (!token) {
      setPurchasedTemplates([]);
      setUserPages([]);
      setLoadingStatus(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/my-templates`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const templateData = await response.json().catch(() => []);
      const purchased = normalizeList(templateData);

      if (templateData?.active_plan || templateData?.plan_slug) {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            active_plan: templateData.active_plan || storedUser.active_plan,
            plan_slug: templateData.plan_slug || storedUser.plan_slug,
            active_subscription:
              templateData.active_subscription ||
              storedUser.active_subscription,
            subscription: templateData.subscription || storedUser.subscription,
          }),
        );
      }

      const pagesData = await getUserPages();
      const pages = normalizeList(pagesData);

      setPurchasedTemplates(purchased);
      setUserPages(pages);
    } catch (error) {
      console.error("Error cargando estado:", error);
      setPurchasedTemplates([]);
      setUserPages([]);
    } finally {
      setLoadingStatus(false);
    }
  };

  const reloadAll = async () => {
    await Promise.all([loadTemplates(), loadUserTemplateStatus()]);
  };

  useEffect(() => {
    reloadAll();
  }, []);

  const filteredTemplates = templates.filter((template) => {
    const title = template.title || template.name || "";
    return title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <main className="templates-main">
      <section className="templates-browser">
        <div className="templates-toolbar">
          <label className="template-search">
            <span>⌕</span>

            <input
              type="search"
              placeholder="Buscar plantillas..."
              aria-label="Buscar plantillas"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <button className="template-sort" type="button">
            Tendencia ⌄
          </button>

          <div className="template-filters" aria-label="Categorías">
            <button className="active" type="button">
              Todos
            </button>

            <button type="button">Juegos</button>
            <button type="button">San Valentín</button>
            <button type="button">Cumpleaños</button>
          </div>
        </div>

        <h1 className="sr-only">Plantillas disponibles</h1>

        {loadingTemplates ? (
          <div className="empty-panel large">
            <h2>Cargando plantillas...</h2>
          </div>
        ) : (
          <>
            <div className="templates-grid">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  purchasedTemplates={purchasedTemplates}
                  userPages={userPages}
                  loadingStatus={loadingStatus}
                  onStatusChange={reloadAll}
                />
              ))}
            </div>

            <div className="templates-pagination" aria-label="Paginación">
              <p>
                Mostrando {filteredTemplates.length} de {templates.length}{" "}
                plantillas
              </p>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
