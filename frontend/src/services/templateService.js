import API_URL from "./api";

const API = `${API_URL}/api`;

function getToken() {
  return (
    localStorage.getItem("apiToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("access_token")
  );
}

async function request(endpoint, options = {}) {
  const token = getToken();

  const response = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        Object.values(data.errors || {})[0]?.[0] ||
        `Error ${response.status}`,
    );
  }

  return data;
}

export async function getTemplates() {
  return request("/templates");
}

export async function purchaseTemplate(templateId) {
  return request(`/templates/${templateId}/purchase`, {
    method: "POST",
  });
}

export async function getMyTemplates() {
  return request("/my-templates");
}
