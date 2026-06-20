import { request } from "../api";

export function getAdminLinkOptions() {
  return request("/api/admin/link-options");
}

export function createAdminLinkOption(payload) {
  return request("/api/admin/link-options", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminLinkOption(id, payload) {
  return request(`/api/admin/link-options/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminLinkOption(id) {
  return request(`/api/admin/link-options/${id}`, {
    method: "DELETE",
  });
}
