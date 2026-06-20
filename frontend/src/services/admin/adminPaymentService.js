import { API_URL } from "../../config/api";

const API = `${API_URL}/api`;

function getHeaders() {
  const token = localStorage.getItem("apiToken");

  return {
    Accept: "application/json",

    Authorization: `Bearer ${token}`,

    "Content-Type": "application/json",
  };
}

export async function getPendingPayments() {
  const response = await fetch(`${API}/admin/payments/pending`, {
    headers: getHeaders(),
  });

  return await response.json();
}

export async function approvePayment(id) {
  const response = await fetch(`${API}/admin/payments/${id}/approve`, {
    method: "POST",

    headers: getHeaders(),
  });

  return await response.json();
}

export async function rejectPayment(id) {
  const response = await fetch(`${API}/admin/payments/${id}/reject`, {
    method: "POST",

    headers: getHeaders(),
  });

  return await response.json();
}
