import multer from "multer";
import path from "path";

// ✅ storage config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "server/uploads/products"); 
  },
 filename(req, file, cb) {
  const ext = path.extname(file.originalname);

  const uniqueName =
    "product-" +
    Date.now() +
    "-" +
    Math.round(Math.random() * 1e9) +
    ext;

  cb(null, uniqueName);
}

});

// ✅ image file check
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|avif/;
  const extname = filetypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype =
    file.mimetype.startsWith("image/");

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Images only!"));
  }
}


// ✅ multer middleware
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export default upload;
