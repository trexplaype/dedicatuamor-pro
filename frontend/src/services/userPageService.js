import { request } from "./api";

export function getUserPages() {
  return request("/api/user-pages");
}

export function getMyPages() {
  return request("/api/my-pages");
}

export function createUserPage(templateId, title = "Mi página especial") {
  return request(`/api/templates/${templateId}/pages`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export function createPageFromTemplate(
  templateId,
  title = "Mi página especial",
) {
  return request(`/api/templates/${templateId}/create-page`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export function getUserPage(pageId) {
  return request(`/api/user-pages/${pageId}`);
}

export function getPageEditor(pageId) {
  return request(`/api/pages/${pageId}/editor`);
}

export function updateUserPage(pageId, payload) {
  return request(`/api/user-pages/${pageId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updatePage(pageId, payload) {
  return request(`/api/pages/${pageId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/* =========================
   PUBLICAR PÁGINA
========================= */

export function getAvailableLinks(pageId) {
  return request(`/api/pages/${pageId}/available-links`);
}

export function getAvailableQrStyles(pageId) {
  return request(`/api/pages/${pageId}/available-qr-styles`);
}

export function publishPage(pageId, payload) {
  return request(`/api/pages/${pageId}/publish`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
