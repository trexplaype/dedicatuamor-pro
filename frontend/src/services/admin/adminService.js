import { request } from "../api";

export function getAdminDashboard() {
  return request("/api/admin/dashboard");
}

export function getAdminUsers() {
  return request("/api/admin/users");
}

export function getPendingPayments() {
  return request("/api/admin/payments/pending");
}

export function getApprovedPayments() {
  return request("/api/admin/payments/approved");
}

export function getRejectedPayments() {
  return request("/api/admin/payments/rejected");
}

export function getExpiredPayments() {
  return request("/api/admin/payments/expired");
}

export function approvePayment(paymentId) {
  return request(`/api/admin/payments/${paymentId}/approve`, {
    method: "POST",
  });
}

export function rejectPayment(paymentId) {
  return request(`/api/admin/payments/${paymentId}/reject`, {
    method: "POST",
  });
}

export function getAdminUserPages() {
  return request("/api/admin/user-pages");
}

export function restoreAdminUserPage(pageId) {
  return request(`/api/admin/user-pages/${pageId}/restore`, {
    method: "POST",
  });
}

export function extendAdminUserPage(pageId, days = 30) {
  return request(`/api/admin/user-pages/${pageId}/extend`, {
    method: "POST",
    body: JSON.stringify({ days }),
  });
}

export function deleteAdminUserPage(pageId) {
  return request(`/api/admin/user-pages/${pageId}`, {
    method: "DELETE",
  });
}
