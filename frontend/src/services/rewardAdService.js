import.meta.env.VITE_API_URL || "https://api.ebookpackstore.com";
function getToken() {
  return localStorage.getItem("apiToken");
}

async function request(endpoint, body) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error en la solicitud");
  }

  return data;
}

export function startRewardAd(actionType) {
  return request("/rewards/ads/start", {
    action_type: actionType,
  });
}

export function claimRewardAd(sessionId) {
  return request("/rewards/ads/claim", {
    session_id: sessionId,
  });
}

export function cancelRewardAd(sessionId) {
  return request("/rewards/ads/cancel", {
    session_id: sessionId,
  });
}
