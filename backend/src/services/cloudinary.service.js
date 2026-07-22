import { v2 as cloudinary } from "cloudinary";

const requiredKeys = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

let configured = false;

function configureCloudinary() {
  if (configured) return;

  const missing = requiredKeys.filter((key) => !process.env[key]);
  if (missing.length) {
    const error = new Error(`Cloudinary is not configured: ${missing.join(", ")}`);
    error.status = 500;
    throw error;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

function resourceTypeFor(file) {
  if (file?.mimetype?.startsWith("image/")) return "image";
  if (file?.mimetype?.startsWith("video/") || file?.mimetype?.startsWith("audio/")) return "video";
  return "raw";
}

export async function uploadToCloudinary(file, { folder } = {}) {
  if (!file?.buffer) {
    const error = new Error("Upload file is missing");
    error.status = 400;
    throw error;
  }

  configureCloudinary();
  const resourceType = resourceTypeFor(file);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        use_filename: false,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, resourceType });
      }
    );

    stream.end(file.buffer);
  });
}
