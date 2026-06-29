import {
  sendMessage,
  getMessages,
} from "../services/chat.service.js";

export async function createMessage(req, res) {
  try {
    const message = await sendMessage(req.body);

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

export async function fetchMessages(req, res) {
  try {
    const messages = await getMessages(req.params.swapId);

    res.json({
      success: true,
      data: messages,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}