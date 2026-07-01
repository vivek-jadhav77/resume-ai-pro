const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobDescription",
    },
    jobHash: {
      type: String,
    },
    atsScore: {
      type: Number,
    },
    analysisQuality: {
      type: String,
    },
    scoreBreakdown: {
      skills: Number,
      experience: Number,
      projects: Number,
      education: Number,
      quality: Number,
    },
    matchPercentage: {
      type: Number,
    },
    matchedSkills: [String],
    criticalMissingSkills: [String],
    importantMissingSkills: [String],
    optionalSkills: [String],
    strengths: [String],
    missingKeywords: [String],
    suggestions: [String],
    roleDetected: {
      type: String,
    },
    executiveSummary: {
      type: String,
    },
    scoreBand: {
      type: String,
    },
    missingSkillExplanations: [
      {
        skill: String,
        reason: String,
      }
    ],
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for performance
ReportSchema.index({ userId: 1 });
ReportSchema.index({ resumeId: 1, jobHash: 1 });

module.exports = mongoose.model("Report", ReportSchema);
