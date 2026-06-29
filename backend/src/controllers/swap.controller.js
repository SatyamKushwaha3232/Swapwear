import {
  createSwapRequest,
  fetchSwapRequests,
  updateSwapStatus,
} from "../services/swap.service.js";

export async function sendSwapRequest(req, res) {
  try {
    const request = await createSwapRequest(req.body);
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getSwapRequests(req, res) {
  try {
    const requests = await fetchSwapRequests(req.query.userId);
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function acceptSwapRequest(req, res) {
  try {
    const request = await updateSwapStatus(req.params.id, "accepted");
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function rejectSwapRequest(req, res) {
  try {
    const request = await updateSwapStatus(req.params.id, "rejected");
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}