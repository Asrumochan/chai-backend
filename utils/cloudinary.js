import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.log("❌ No file path provided");
      return null;
    }

    // Configure cloudinary here to ensure env vars are loaded
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);
    console.log("🗑️ Local file deleted");

    return response;
  } catch (error) {
    // Delete local file even on error
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log("🗑️ Local file deleted after error");
    }
    return null;
  }
};
const deleteFromCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.log("❌ No file path provided");
      return null;
    }

    // Configure cloudinary here to ensure env vars are loaded
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const response = await cloudinary.api.delete_resources(localFilePath, {
      resource_type: "image",
    });
    return response;
  } catch (error) {
    console.log(error)
    return null;
  }
};

export {uploadOnCloudinary, deleteFromCloudinary};
