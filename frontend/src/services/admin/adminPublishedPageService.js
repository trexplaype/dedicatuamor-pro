import { request } from "../api";

export function getAdminPublishedPages() {
  return request("/api/admin/published-pages");
}

export function updateAdminPublishedPage(id, payload) {
  return request(`/api/admin/published-pages/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminPublishedPage(id) {
  return request(`/api/admin/published-pages/${id}`, {
    method: "DELETE",
  });
}
