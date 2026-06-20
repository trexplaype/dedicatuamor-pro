import { request } from "../api";

export function getAdminQrStyles() {
  return request("/api/admin/qr-styles");
}

export function createAdminQrStyle(payload) {
  return request("/api/admin/qr-styles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminQrStyle(id, payload) {
  return request(`/api/admin/qr-styles/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminQrStyle(id) {
  return request(`/api/admin/qr-styles/${id}`, {
    method: "DELETE",
  });
}
