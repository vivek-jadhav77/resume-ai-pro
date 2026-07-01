const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: {
      type: String,
      required: true, // URL from Cloudinary
    },
    fileName: {
      type: String, // Original uploaded file name
    },
    extractedText: {
      type: String,
      required: true, // Raw text from pdf-parse/mammoth
    },
    parsedData: {
      name: String,
      email: String,
      phone: String,
      skills: [String],
      education: [
        {
          institution: String,
          degree: String,
          years: String,
        },
      ],
      experience: [
        {
          company: String,
          role: String,
          years: String,
          description: String,
        },
      ],
      projects: [
        {
          title: String,
          description: String,
        },
      ],
      certifications: [String],
    },
  },
  { timestamps: true }
);

// Indexes for performance
ResumeSchema.index({ userId: 1 });

module.exports = mongoose.model("Resume", ResumeSchema);
