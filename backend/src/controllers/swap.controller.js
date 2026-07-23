import {
  archiveCompletedSwapItems,
  confirmSwapHandover,
  confirmSwapReceived,
  createSwapRequest,
  fetchSwapById,
  fetchSwapRequests,
  getOpenSwapDisputes,
  openSwapDispute,
  resolveSwapDispute,
  setSwapDeliveryMethod,
  updateSwapStatus,
} from "../services/swap.service.js";

function sendError(res, err) {
  console.error("Swap request failed:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Swap action failed",
  });
}

export async function sendSwapRequest(req, res) {
  try {
    const request = await createSwapRequest(req.body, req.user);
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    sendError(res, err);
  }
}

export async function getSwapRequests(req, res) {
  try {
    const requests = await fetchSwapRequests(req.query.userId, req.user);
    res.json({ success: true, data: requests });
  } catch (err) {
    sendError(res, err);
  }
}

export async function getSwapRequest(req, res) {
  try {
    const request = await fetchSwapById(req.params.id, req.user);
    res.json({ success: true, data: request });
  } catch (err) {
    sendError(res, err);
  }
}

export async function setSwapStatus(req, res) {
  try {
    const request = await updateSwapStatus(
      req.params.id,
      req.body.status,
      req.user,
      req.body.reason || ""
    );
    res.json({ success: true, data: request });
  } catch (err) {
    sendError(res, err);
  }
}

export async function acceptSwapRequest(req, res) {
  req.body.status = "accepted";
  return setSwapStatus(req, res);
}

export async function rejectSwapRequest(req, res) {
  req.body.status = "rejected";
  return setSwapStatus(req, res);
}

export async function updateDeliveryMethod(req, res) {
  try {
    const request = await setSwapDeliveryMethod(req.params.id, req.body.method, req.user);
    res.json({ success: true, data: request });
  } catch (err) {
    sendError(res, err);
  }
}

export async function confirmHandover(req, res) {
  try {
    const request = await confirmSwapHandover(req.params.id, req.body.note || "", req.user);
    res.json({ success: true, data: request });
  } catch (err) {
    sendError(res, err);
  }
}

export async function confirmReceived(req, res) {
  try {
    const request = await confirmSwapReceived(req.params.id, req.body.note || "", req.user);
    res.json({ success: true, data: request });
  } catch (err) {
    sendError(res, err);
  }
}

export async function createDispute(req, res) {
  try {
    const request = await openSwapDispute(req.params.id, req.body.reason || "", req.user);
    res.json({ success: true, data: request });
  } catch (err) {
    sendError(res, err);
  }
}

export async function listOpenDisputes(_req, res) {
  try {
    const data = await getOpenSwapDisputes();
    res.json({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
}

export async function resolveDispute(req, res) {
  try {
    const request = await resolveSwapDispute(
      req.params.disputeId,
      req.body.decision,
      req.body.resolution || "",
      req.user
    );
    res.json({ success: true, data: request });
  } catch (err) {
    sendError(res, err);
  }
}

export async function archiveSwapItems(req, res) {
  try {
    const request = await archiveCompletedSwapItems(req.params.id, req.user);
    res.json({ success: true, data: request });
  } catch (err) {
    sendError(res, err);
  }
}
