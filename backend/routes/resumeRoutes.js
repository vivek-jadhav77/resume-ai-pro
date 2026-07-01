const express = require("express");
const router = express.Router();
const { uploadResume, getUserResumes, deleteResume } = require("../controllers/resumeController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.post("/upload", protect, upload.single("resume"), uploadResume);
router.get("/", protect, getUserResumes);
router.delete("/:id", protect, deleteResume);

module.exports = router;
