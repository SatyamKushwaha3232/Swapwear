import {
  fetchListings,
  fetchListingById,
  createListingInDb,
  deleteListingFromDb,
  uploadListingFile,
} from "../services/listing.service.js";

export async function getListings(req, res) {
  try {
    const listings = await fetchListings(req.query.userId || null);
    res.json({ success: true, data: listings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getListingById(req, res) {
  try {
    const listing = await fetchListingById(req.params.id);
    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createListing(req, res) {
  try {
    const imageFiles = req.files?.images || [];
    const videoFile = req.files?.video?.[0] || null;

    const imageUrls = [];
    for (const file of imageFiles) {
      imageUrls.push(await uploadListingFile(file, "images"));
    }

    let videoUrl = "";
    if (videoFile) {
      videoUrl = await uploadListingFile(videoFile, "videos");
    }

    const payload = {
      title: req.body.title,
      brand: req.body.brand,
      category: req.body.category,
      size: req.body.size,
      condition: req.body.condition || "Good",
      location: req.body.location,
      points: Number(req.body.points) || 0,
      description: req.body.description || "",
      image: imageUrls[0] || "",
      images: imageUrls,
      video: videoUrl,
      owner_name: req.body.owner_name || "SwapWear User",
      user_id: req.body.user_id || null,
    };

    const listing = await createListingInDb(payload);

    res.status(201).json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteListing(req, res) {
  try {
    await deleteListingFromDb(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}