const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobType: {
      type: String, // 'interview', 'cover-letter', 'optimize'
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    result: {
      type: mongoose.Schema.Types.Mixed, // flexible for different job results
    },
    error: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
