import API_URL from "../api";

function getToken() {
  return localStorage.getItem("apiToken");
}

export async function getAdminAnalytics() {
  const response = await fetch(`${API_URL}/api/admin/analytics`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Error al cargar analíticas");
  }

  return data;
}
