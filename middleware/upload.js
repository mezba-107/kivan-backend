import dotenv from "dotenv";
dotenv.config({ path: "./server/.env" });

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    resource_type: "auto",
  },
});

const upload = multer({ storage });
export default upload;


// 👤 PROFILE IMAGE UPLOADER
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profiles",
    resource_type: "image",
  },
});

export const profileUpload = multer({ storage: profileStorage });
