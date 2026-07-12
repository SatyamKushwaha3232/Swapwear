import {
  addDeliveryProof,
  createAddress,
  getSwapDelivery,
  listAddresses,
  setDefaultAddress,
  setupSwapDelivery,
  updateDeliveryStatus,
  updateDeliveryTracking,
} from "./delivery.service.js";

function sendError(res, err) {
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Delivery action failed",
  });
}

export async function getAddresses(req, res) {
  try {
    res.json({ success: true, data: await listAddresses(req.user) });
  } catch (err) {
    sendError(res, err);
  }
}

export async function postAddress(req, res) {
  try {
    res.status(201).json({ success: true, data: await createAddress(req.body, req.user) });
  } catch (err) {
    sendError(res, err);
  }
}

export async function makeDefaultAddress(req, res) {
  try {
    res.json({ success: true, data: await setDefaultAddress(req.params.id, req.user) });
  } catch (err) {
    sendError(res, err);
  }
}

export async function getSwapDeliveryOrders(req, res) {
  try {
    res.json({ success: true, data: await getSwapDelivery(req.params.swapId, req.user) });
  } catch (err) {
    sendError(res, err);
  }
}

export async function createSwapDelivery(req, res) {
  try {
    res.status(201).json({
      success: true,
      data: await setupSwapDelivery(req.params.swapId, req.body, req.user),
    });
  } catch (err) {
    sendError(res, err);
  }
}

export async function patchDeliveryStatus(req, res) {
  try {
    res.json({
      success: true,
      data: await updateDeliveryStatus(req.params.id, req.body.status, req.user),
    });
  } catch (err) {
    sendError(res, err);
  }
}

export async function patchDeliveryTracking(req, res) {
  try {
    res.json({
      success: true,
      data: await updateDeliveryTracking(req.params.id, req.body, req.user),
    });
  } catch (err) {
    sendError(res, err);
  }
}

export async function postDeliveryProof(req, res) {
  try {
    res.json({
      success: true,
      data: await addDeliveryProof(req.params.id, req.body, req.user),
    });
  } catch (err) {
    sendError(res, err);
  }
}
