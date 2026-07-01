const multer = require("multer");
const path = require("path");

// Use memory storage to process files directly or upload to Cloudinary directly
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword"
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype) || (ext !== ".pdf" && ext !== ".docx" && ext !== ".doc")) {
      return cb(new Error("Invalid file format. Only true PDFs and DOCX files are allowed."), false);
    }
    cb(null, true);
  },
});

module.exports = upload;
