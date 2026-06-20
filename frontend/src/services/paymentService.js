import { API_URL } from "../config/api";

const API = `${API_URL}/api`;

function getToken() {
  return localStorage.getItem("apiToken") || localStorage.getItem("apiToken");
}

export async function createManualCoinsPayment(data) {
  const token = getToken();

  if (!token) {
    throw {
      message:
        "No se encontró el token de autenticación. Inicia sesión nuevamente.",
    };
  }

  const response = await fetch(`${API}/payments/manual/coins`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",

      Accept: "application/json",

      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(data),
  });

  const result = await response.json();

  console.log("PAYMENT RESPONSE:", result);

  if (!response.ok) {
    throw result;
  }

  return result;
}

export async function getMyPayments() {
  const token = getToken();

  if (!token) {
    throw {
      message: "No se encontró el token de autenticación.",
    };
  }

  const response = await fetch(`${API}/payments/my-payments`, {
    headers: {
      Accept: "application/json",

      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  console.log("MY PAYMENTS RESPONSE:", result);

  if (!response.ok) {
    throw result;
  }

  return result;
}
