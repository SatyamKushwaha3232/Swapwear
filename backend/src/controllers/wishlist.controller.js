import {
  getWishlist,
  addWishlist,
  removeWishlist,
} from "../services/wishlist.service.js";

export async function fetchWishlist(req, res) {
  try {
    const data = await getWishlist(req.query.userId);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

export async function createWishlist(req, res) {
  try {
    const data = await addWishlist(req.body);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

export async function deleteWishlist(req, res) {
  try {
    await removeWishlist(req.params.id);

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}