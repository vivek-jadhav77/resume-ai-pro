const Resume = require("../models/Resume");
const cloudinary = require("../config/cloudinary");
const { extractTextFromFile } = require("../utils/parser");
const { extractResumeData } = require("../services/aiService");

// @desc    Upload a resume, parse text, extract data, save to DB
// @route   POST /api/resume/upload
// @access  Private
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a file" });
    }

    const fileBuffer = req.file.buffer;
    const mimetype = req.file.mimetype;

    // 1. Extract raw text from PDF/DOCX
    const rawText = await extractTextFromFile(fileBuffer, mimetype);

    // 2. Upload file to Cloudinary
    // We need to convert buffer to base64 to upload via Cloudinary upload api
    const b64 = Buffer.from(fileBuffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const cloudRes = await cloudinary.uploader.upload(dataURI, {
      resource_type: "raw",
      folder: "resumes",
    });

    // 3. Extract structured data using OpenAI
    const parsedData = await extractResumeData(rawText);

    // 4. Save to Database
    const resume = await Resume.create({
      userId: req.user._id,
      fileUrl: cloudRes.secure_url,
      fileName: req.file.originalname,
      extractedText: rawText,
      parsedData: parsedData,
    });

    res.status(201).json({
      message: "Resume uploaded and parsed successfully",
      resume,
    });
  } catch (error) {
    console.error("Resume Upload Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all resumes for logged in user
// @route   GET /api/resume
// @access  Private
exports.getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resume/:id
// @access  Private
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }
    
    // Optionally: could delete from cloudinary here, but skipping for simplicity
    // Delete the resume
    await Resume.deleteOne({ _id: req.params.id });
    
    res.json({ message: "Resume removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
