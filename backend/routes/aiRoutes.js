const express = require("express");
const router = express.Router();
const { analyzeResume, generateInterviewQuestions, generateCoverLetter, optimizeResume, getUserReports, getJobStatus } = require("../controllers/aiController");
const { protect } = require("../middlewares/authMiddleware");
const { atsRateLimiter } = require("../middlewares/rateLimiter");

router.post("/analyze", protect, atsRateLimiter, analyzeResume);
router.get("/reports", protect, getUserReports);
router.post("/interview", protect, generateInterviewQuestions);
router.post("/cover-letter", protect, generateCoverLetter);
router.post("/optimize", protect, optimizeResume);
router.get("/jobs/:jobId", protect, getJobStatus);

module.exports = router;
