import {
  createPaymentOrder,
  handlePaymentWebhook,
  listAllPayments,
  listMyPayments,
  updatePaymentStatus,
} from "./payments.service.js";

function sendError(res, err) {
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Payment action failed",
  });
}

export async function createOrder(req, res) {
  try {
    const data = await createPaymentOrder(req.body, req.user);
    res.status(201).json({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
}

export async function myPayments(req, res) {
  try {
    res.json({ success: true, data: await listMyPayments(req.user) });
  } catch (err) {
    sendError(res, err);
  }
}

export async function adminPayments(req, res) {
  try {
    res.json({ success: true, data: await listAllPayments(req.user) });
  } catch (err) {
    sendError(res, err);
  }
}

export async function patchPaymentStatus(req, res) {
  try {
    res.json({
      success: true,
      data: await updatePaymentStatus(
        req.params.id,
        req.body.status,
        req.user,
        req.body.metadata || {}
      ),
    });
  } catch (err) {
    sendError(res, err);
  }
}

export async function webhook(req, res) {
  try {
    res.json({ success: true, data: await handlePaymentWebhook(req.body) });
  } catch (err) {
    sendError(res, err);
  }
}
