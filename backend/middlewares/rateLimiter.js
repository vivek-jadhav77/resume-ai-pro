const rateLimit = require("express-rate-limit");

const atsRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 20, // start blocking after 20 requests
  message: {
    error: "Analysis limit reached. Please try again later. Maximum 20 ATS analyses per hour per user."
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = {
  atsRateLimiter,
};
