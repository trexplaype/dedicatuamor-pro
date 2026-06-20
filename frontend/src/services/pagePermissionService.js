import { request } from "./api";

export function getPagePermissions(pageId) {
  return request(`/api/user-pages/${pageId}/permissions`);
}
