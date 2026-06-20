import { request } from "./api";

export function getTemplateCategories() {
  return request("/api/admin/template-categories");
}

export function createTemplateCategory(payload) {
  return request("/api/admin/template-categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTemplateCategory(id, payload) {
  return request(`/api/admin/template-categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteTemplateCategory(id) {
  return request(`/api/admin/template-categories/${id}`, {
    method: "DELETE",
  });
}
