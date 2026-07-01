const express = require("express");
const router = express.Router();
const { getAnalytics } = require("../controllers/analyticsController");
const { protect } = require("../middlewares/authMiddleware");

// In a real application, you would add an admin middleware here.
// For this demo, we allow any logged-in user to see the analytics.
router.get("/", protect, getAnalytics);

module.exports = router;
