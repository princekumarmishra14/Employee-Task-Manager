import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "../../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  }
});

// POST /api/upload
// Accepts multipart/form-data with a "file" field
router.post("/", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    
    // Construct the URL to the uploaded file.
    // In production this might be an S3 bucket URL or a domain, but for now we use the static route
    const fileUrl = `${process.env.API_URL || "http://localhost:5001"}/uploads/${req.file.filename}`;
    
    return res.status(200).json({
      success: true,
      url: fileUrl
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error during file upload" });
  }
});

export default router;
