import { request } from "../api";

export function getAdminRewardTasks() {
  return request("/api/admin/reward-tasks");
}

export function createAdminRewardTask(payload) {
  return request("/api/admin/reward-tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminRewardTask(id, payload) {
  return request(`/api/admin/reward-tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminRewardTask(id) {
  return request(`/api/admin/reward-tasks/${id}`, {
    method: "DELETE",
  });
}
