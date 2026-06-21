import { CapacitorHttp } from "@capacitor/core";

const isCapacitor = window.Capacitor?.isNativePlatform?.();

const API_URL = isCapacitor
  ? "http://10.0.2.2:8000"
  : import.meta.env.VITE_API_URL || "https://api.ebookpackstore.com";

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem("apiToken");
  const url = `${API_URL}${endpoint}`;
  const method = options.method || "GET";
  const isFormData = options.body instanceof FormData;

  if (isCapacitor) {
    const body =
      options.body && !isFormData ? JSON.parse(options.body) : undefined;

    const response = await CapacitorHttp.request({
      url,
      method,
      headers: {
        Accept: "application/json",
        ...(!isFormData ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      data: body,
    });

    if (response.status < 200 || response.status >= 300) {
      const data = response.data || {};
      throw new Error(
        data.message ||
          Object.values(data.errors || {})[0]?.[0] ||
          `Error ${response.status}`,
      );
    }

    return response.data;
  }

  const headers = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    method,
    headers,
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

export const api = {
  login: (payload) =>
    request("/api/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  register: (payload) =>
    request("/api/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  me: () => request("/api/user"),
};

export default API_URL;
