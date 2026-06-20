import API_URL from "./api";

export async function getSettings() {
  const response = await fetch(`${API_URL}/api/settings`);

  if (!response.ok) {
    throw new Error("Error cargando configuración");
  }

  return response.json();
}
