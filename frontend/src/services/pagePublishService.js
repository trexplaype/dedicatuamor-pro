import { request } from "./api";

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

export function checkPageSlug(slug, pageId = null) {
  const params = new URLSearchParams({
    slug,
  });

  if (pageId) {
    params.append("page_id", pageId);
  }

  return request(`/api/pages/check-slug?${params.toString()}`);
}
