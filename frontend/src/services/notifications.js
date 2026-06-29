const API_URL = "http://localhost:5000/api/notifications";

export async function getNotifications(userId) {
  try {
    const res = await fetch(`${API_URL}?userId=${userId}`);
    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || "Failed to fetch notifications");
    }

    return { success: true, data: result.data || [] };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function createNotification(payload) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || "Failed to create notification");
    }

    return { success: true, data: result.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function markNotificationRead(id) {
  try {
    const res = await fetch(`${API_URL}/${id}/read`, {
      method: "PATCH",
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || "Failed to mark read");
    }

    return { success: true, data: result.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}