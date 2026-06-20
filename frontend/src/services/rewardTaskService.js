import { request } from "./api";

export function getRewardTasks() {
  return request("/api/reward-tasks");
}

export function addRewardTaskProgress(taskId) {
  return request(`/api/reward-tasks/${taskId}/progress`, {
    method: "POST",
  });
}
