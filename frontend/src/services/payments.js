import { backendAuthEnabled, backendRequest } from "../lib/backendApi";

export async function createPaymentOrder(payload) {
  if (!backendAuthEnabled) {
    return { success: false, error: "Payments are available in backend mode" };
  }

  try {
    const data = await backendRequest("/payments/order", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to create payment" };
  }
}

export async function getMyPayments() {
  if (!backendAuthEnabled) return { success: true, data: [] };

  try {
    return { success: true, data: await backendRequest("/payments/me") };
  } catch (error) {
    return { success: false, error: error.message || "Unable to load payments", data: [] };
  }
}

export async function cancelPayment(paymentId) {
  if (!backendAuthEnabled) {
    return { success: false, error: "Payments are available in backend mode" };
  }

  try {
    const data = await backendRequest(`/payments/${paymentId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "cancelled" }),
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to cancel payment" };
  }
}

export async function getAdminPayments() {
  if (!backendAuthEnabled) return { success: true, data: [] };

  try {
    return { success: true, data: await backendRequest("/payments/admin") };
  } catch (error) {
    return { success: false, error: error.message || "Unable to load admin payments", data: [] };
  }
}

export async function updatePaymentStatus(paymentId, status, metadata = {}) {
  if (!backendAuthEnabled) {
    return { success: false, error: "Payments are available in backend mode" };
  }

  try {
    const data = await backendRequest(`/payments/${paymentId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, metadata }),
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to update payment" };
  }
}
