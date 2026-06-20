import API_URL from "./api";

export async function claimReward(actionType) {
  const token = localStorage.getItem("apiToken");

  if (!token) {
    throw new Error("Debes iniciar sesión");
  }

  const response = await fetch(`${API_URL}/api/rewards/claim`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      action_type: actionType,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        Object.values(data.errors || {})[0]?.[0] ||
        `Error ${response.status}`,
    );
  }

  return data;
}
