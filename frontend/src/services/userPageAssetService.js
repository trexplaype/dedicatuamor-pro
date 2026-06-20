import { request } from "./api";

export function getPageAssets(pageId) {
  return request(`/api/user-pages/${pageId}/assets`);
}

export function uploadPageAsset(pageId, file, type = "music") {
  const formData = new FormData();

  formData.append("type", type);
  formData.append("source_type", "upload");
  formData.append("file", file);
  formData.append("title", file.name);

  return request(`/api/user-pages/${pageId}/assets`, {
    method: "POST",
    body: formData,
  });
}

export function saveExternalPageAsset(pageId, payload) {
  return request(`/api/user-pages/${pageId}/assets`, {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      source_type: "url",
    }),
  });
}

export function deletePageAsset(assetId) {
  return request(`/api/user-page-assets/${assetId}`, {
    method: "DELETE",
  });
}
