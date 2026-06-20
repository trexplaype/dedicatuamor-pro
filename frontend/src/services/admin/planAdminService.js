import API_URL from "../api";

function getToken() {
  return localStorage.getItem("apiToken");
}

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
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

export function getAdminPlans() {
  return request("/api/admin/plans");
}

export function getAdminPlan(id) {
  return request(`/api/admin/plans/${id}`);
}

export function createAdminPlan(payload) {
  return request("/api/admin/plans", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminPlan(id, payload) {
  return request(`/api/admin/plans/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminPlan(id) {
  return request(`/api/admin/plans/${id}`, {
    method: "DELETE",
  });
}
