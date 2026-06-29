const API_URL = "http://localhost:5000/api/chat";

export async function getMessages(swapId) {
  try {
    const res = await fetch(`${API_URL}/${swapId}`);
    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || "Failed to fetch messages");
    }

    return { success: true, data: result.data || [] };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function sendMessage(payload) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || "Failed to send message");
    }

    return { success: true, data: result.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
