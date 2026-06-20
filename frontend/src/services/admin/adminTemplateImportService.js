import { request } from "../api";

export function importTemplateZip(zipFile) {
  const formData = new FormData();
  formData.append("zip_file", zipFile);

  return request("/api/admin/templates/import-zip", {
    method: "POST",
    body: formData,
  });
}
