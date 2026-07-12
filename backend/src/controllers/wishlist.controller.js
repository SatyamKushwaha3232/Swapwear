import {
  getWishlist,
  addWishlist,
  removeWishlist,
} from "../services/wishlist.service.js";

export async function fetchWishlist(req, res) {
  try {
    const targetUserId = req.query.userId || req.user.id;

    if (targetUserId !== req.user.id && !["ADMIN", "OWNER"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "You can only view your own wishlist",
      });
    }

    const data = await getWishlist(targetUserId);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      error: err.message,
    });
  }
}

export async function createWishlist(req, res) {
  try {
    const data = await addWishlist(req.body, req.user);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      error: err.message,
    });
  }
}

export async function deleteWishlist(req, res) {
  try {
    await removeWishlist(req.params.id, req.user);

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      error: err.message,
    });
  }
}
