const mongoose = require("mongoose");

const JobDescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    extractedKeywords: {
      required: [String],
      preferred: [String],
    },
    jobHash: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobDescription", JobDescriptionSchema);
