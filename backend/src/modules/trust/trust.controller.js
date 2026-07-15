import {
  createMarketplaceReport,
  getAdminDashboardData,
  getUserReviews,
  resolveMarketplaceReport,
  submitSwapReview,
} from "./trust.service.js";

function sendError(res, err) {
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Trust action failed",
  });
}

export async function createReport(req, res) {
  try {
    res.status(201).json({
      success: true,
      data: await createMarketplaceReport(req.body, req.user),
    });
  } catch (err) {
    sendError(res, err);
  }
}

export async function submitReview(req, res) {
  try {
    res.status(201).json({
      success: true,
      data: await submitSwapReview(
        req.body.swapId || req.body.swap_id,
        req.body.rating,
        req.body.comment || "",
        req.user
      ),
    });
  } catch (err) {
    sendError(res, err);
  }
}

export async function listUserReviews(req, res) {
  try {
    res.json({ success: true, data: await getUserReviews(req.params.userId) });
  } catch (err) {
    sendError(res, err);
  }
}

export async function adminDashboard(req, res) {
  try {
    res.json({ success: true, data: await getAdminDashboardData(req.user) });
  } catch (err) {
    sendError(res, err);
  }
}

export async function resolveReport(req, res) {
  try {
    res.json({
      success: true,
      data: await resolveMarketplaceReport(
        req.params.id,
        req.body.status,
        req.body.note || "",
        req.user
      ),
    });
  } catch (err) {
    sendError(res, err);
  }
}
