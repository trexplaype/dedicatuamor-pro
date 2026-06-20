import { request } from "../api";

export function getAdminTemplateCategories() {
  return request("/api/admin/template-categories");
}
