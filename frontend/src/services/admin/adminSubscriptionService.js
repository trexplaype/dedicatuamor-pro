import { request } from "../api";

export function getAdminSubscriptions() {
  return request("/api/admin/subscriptions");
}

export function updateAdminSubscription(id, payload) {
  return request(`/api/admin/subscriptions/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminSubscription(id) {
  return request(`/api/admin/subscriptions/${id}`, {
    method: "DELETE",
  });
}
