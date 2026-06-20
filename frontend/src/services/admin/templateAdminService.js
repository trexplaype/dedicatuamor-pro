import API_URL from "../api";

function getToken() {
  return localStorage.getItem("apiToken");
}

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
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

export function getTemplates() {
  return request("/api/admin/templates");
}

export function getTemplate(id) {
  return request(`/api/admin/templates/${id}`);
}

export function createTemplate(formData) {
  return request("/api/admin/templates", {
    method: "POST",
    body: formData,
  });
}

export function importTemplateZip(formData) {
  return request("/api/admin/templates/import-zip", {
    method: "POST",
    body: formData,
  });
}

export function updateTemplate(id, formData) {
  return request(`/api/admin/templates/${id}`, {
    method: "POST",
    headers: {
      "X-HTTP-Method-Override": "PUT",
    },
    body: formData,
  });
}

export function deleteTemplate(id) {
  return request(`/api/admin/templates/${id}`, {
    method: "DELETE",
  });
}
