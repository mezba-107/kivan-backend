import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ correct upload path
const uploadPath = path.join(process.cwd(), "uploads", "products");

// ✅ create folder if not exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(
      null,
      "product-" + Date.now() + "-" + Math.round(Math.random() * 1e9) + ext
    );
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|avif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith("image/");

  if (extname && mimetype) cb(null, true);
  else cb(new Error("Images only!"));
}

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  },
});

export default upload;
