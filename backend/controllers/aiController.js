const crypto = require("crypto");
const Resume = require("../models/Resume");
const JobDescription = require("../models/JobDescription");
const Report = require("../models/Report");
const Job = require("../models/Job");
const { analyzeResumeWithGemini } = require("../services/aiService");
const { parseJobDescription } = require("../services/jobDescriptionParser");
const { detectRole, getRoleSkillMap } = require("../services/roleIntelligence");
const { validateAndNormalizeSkills } = require("../services/skillValidation");
const { enrichSkillsWithBenchmarks } = require("../services/benchmarkEngine");
const { calculateScoreBreakdown } = require("../services/scoringEngine");
const { genAI, withFallback } = require("../utils/aiHelper");

// @desc    Analyze resume against job description and get ATS score
// @route   POST /api/ai/analyze
// @access  Private
exports.analyzeResume = async (req, res) => {
  try {
    const { resumeId, jobDescriptionText, jobTitle, company } = req.body;

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // 1. Caching Layer: Hash Job Description
    const jobHash = crypto.createHash('sha256').update(jobDescriptionText).digest('hex');

    const existingReport = await Report.findOne({ resumeId, jobHash });
    if (existingReport) {
      console.log("Serving cached ATS report from database.");
      const existingJd = await JobDescription.findById(existingReport.jobId);
      return res.json({ report: existingReport, jd: existingJd });
    }

    let jd = await JobDescription.create({
      userId: req.user._id,
      title: jobTitle || "Untitled Job",
      company: company || "Unknown Company",
      description: jobDescriptionText,
      jobHash: jobHash,
      extractedKeywords: { required: [], preferred: [] },
    });

    // 2. Semantic JD Parsing: Extract skills
    const parsedJd = await parseJobDescription(jobDescriptionText);

    // 3. Validate & Normalize Skills
    const normalizedJdSkills = {
      critical: validateAndNormalizeSkills(parsedJd.requiredSkills || []),
      important: validateAndNormalizeSkills(parsedJd.preferredSkills || []),
      optional: validateAndNormalizeSkills(parsedJd.optionalSkills || [])
    };

    const rawJdSkillsCount = (
      (parsedJd.requiredSkills?.length || 0) +
      (parsedJd.preferredSkills?.length || 0) +
      (parsedJd.optionalSkills?.length || 0)
    );
    const normalizedJdSkillsCount = (
      (normalizedJdSkills.critical?.length || 0) +
      (normalizedJdSkills.important?.length || 0) +
      (normalizedJdSkills.optional?.length || 0)
    );

    // 4. Dynamic Role Detection
    const roleDetected = detectRole(jobTitle, jobDescriptionText, normalizedJdSkills.critical);
    const { matchedRole } = getRoleSkillMap(roleDetected);

    // 5. Industry Benchmark Enrichment
    const enrichedJdSkills = enrichSkillsWithBenchmarks(roleDetected, normalizedJdSkills);

    // 6. Deterministic Score & Confidence math in JavaScript
    const scoringResult = calculateScoreBreakdown(
      resume.parsedData || {},
      roleDetected,
      enrichedJdSkills,
      jobDescriptionText,
      rawJdSkillsCount,
      normalizedJdSkillsCount,
      matchedRole,
      resume.extractedText
    );

    // 7. Gemini Semantic suggestions (purely for copy writing recommendations/strengths)
    const aiResult = await analyzeResumeWithGemini(
      resume.extractedText,
      resume.parsedData,
      scoringResult.matchedSkills,
      scoringResult.criticalMissingSkills,
      scoringResult.importantMissingSkills,
      scoringResult.optionalSkills,
      roleDetected
    );

    // Handle Fallback specific message
    const suggestions = aiResult.suggestions || [];
    if (aiResult.fallbackNotice) {
      suggestions.push(aiResult.fallbackNotice);
    }

    // 8. Save Report to Database
    const report = await Report.create({
      userId: req.user._id,
      resumeId: resume._id,
      jobId: jd._id,
      jobHash: jobHash,
      atsScore: scoringResult.atsScore,
      scoreBand: scoringResult.scoreBand,
      analysisQuality: scoringResult.analysisQuality,
      scoreBreakdown: scoringResult.scoreBreakdown,
      matchPercentage: scoringResult.atsScore, // legacy fallback
      matchedSkills: scoringResult.matchedSkills,
      criticalMissingSkills: scoringResult.criticalMissingSkills,
      importantMissingSkills: scoringResult.importantMissingSkills,
      optionalSkills: scoringResult.optionalSkills,
      strengths: aiResult.strengths || [],
      missingKeywords: [
        ...(scoringResult.criticalMissingSkills || []),
        ...(scoringResult.importantMissingSkills || []),
        ...(scoringResult.optionalSkills || [])
      ],
      executiveSummary: aiResult.executiveSummary,
      missingSkillExplanations: aiResult.missingSkillExplanations,
      suggestions: suggestions,
      roleDetected: roleDetected,
      analyzedAt: new Date()
    });

    res.json({ report, jd });
  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: "ATS Analysis failed to complete." });
  }
};

// @desc    Get user's past ATS reports for analytics
exports.getUserReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id })
      .populate("resumeId")
      .populate("jobId")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- BACKGROUND JOB QUEUE IMPLEMENTATIONS ---

// Get job status endpoint
exports.getJobStatus = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, userId: req.user._id });
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Generate interview questions
exports.generateInterviewQuestions = async (req, res) => {
  try {
    const { resumeId, jobDescriptionId } = req.body;
    
    // Create background job
    const job = await Job.create({ userId: req.user._id, jobType: "interview", status: "processing" });
    res.json({ jobId: job._id, status: "Processing..." });

    // Run async without awaiting to not block response
    (async () => {
      try {
        const resume = await Resume.findById(resumeId);
        let jdText = "";
        if (jobDescriptionId) {
          const jd = await JobDescription.findById(jobDescriptionId);
          if (jd) jdText = jd.description;
        }

        const operation = async () => {
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
          const prompt = `You are an expert technical interviewer. Based on the following resume data ${jdText ? "and job description" : ""}, generate 5 technical and 3 behavioral interview questions to ask this candidate. Format response strictly as a raw JSON object: {"technical": ["..."], "behavioral": ["..."]}. Resume Data: ${JSON.stringify(resume.parsedData)} ${jdText ? `Job Description:\n${jdText}` : ""}`;
          const result = await model.generateContent(prompt);
          const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(responseText);
        };

        const fallback = { technical: ["Tell me about your experience."], behavioral: ["Describe a challenge you faced."] };
        const questions = await withFallback(operation, fallback, "Interview Generation");

        job.status = "completed";
        job.result = questions;
        await job.save();
      } catch (err) {
        job.status = "failed";
        job.error = err.message;
        await job.save();
      }
    })();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Generate a cover letter
exports.generateCoverLetter = async (req, res) => {
  try {
    const { resumeId, jobDescriptionText, company } = req.body;
    
    const job = await Job.create({ userId: req.user._id, jobType: "cover-letter", status: "processing" });
    res.json({ jobId: job._id, status: "Processing..." });

    (async () => {
      try {
        const resume = await Resume.findById(resumeId);
        if (!resume) throw new Error("Resume not found");

        const operation = async () => {
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
          const prompt = `You are an expert AI Career Coach, ATS Specialist, and Technical Recruiter.

Your task is to generate highly personalized, ATS-optimized, professional cover letters using ONLY the information provided in the candidate's resume and the target job description.

CRITICAL RULES:

1. NO HALLUCINATIONS
* Never invent skills, technologies, projects, certifications, achievements, responsibilities, companies, education details, or experiences.
* Only use information explicitly present in the resume.
* If a required skill is missing from the resume, do not pretend the candidate has it.
* Never use phrases such as "likely", "probably", "appears to", "may have", "seems to", "presumably".

2. STRONG PERSONALIZATION
* Analyze the job description.
* Identify the most important requirements.
* Match those requirements with the candidate's actual experience.
* Mention the most relevant projects, internships, achievements, and technical skills.
* Explain WHY the candidate is a strong fit.

3. PROFESSIONAL WRITING STYLE
* Use modern professional language.
* Avoid generic AI-generated phrases.
* Avoid excessive flattery.
* Keep sentences concise and impactful.
* Sound human and recruiter-friendly.

4. LENGTH CONTROL
Generate three versions:
A) Short Version (200–250 words)
B) Standard Version (300–400 words)
C) Detailed Version (450–600 words)

5. INTERNSHIP DETECTION
* If the role is an internship: Focus on projects, coursework, internships, skills, and learning ability.
* If the role is full-time: Focus on professional achievements, impact, ownership, and business value.

6. ATS OPTIMIZATION
* Naturally include important keywords from the job description.
* Do not keyword-stuff.
* Maintain readability.

7. OUTPUT FORMAT
Return strictly a JSON object with no markdown formatting like \`\`\`json. The structure must be exactly:
{
  "shortVersion": "",
  "standardVersion": "",
  "detailedVersion": "",
  "score": {
    "overallScore": 0,
    "jdAlignment": 0,
    "keywordCoverage": 0,
    "professionalTone": 0,
    "authenticity": 0,
    "readability": 0,
    "lengthScore": 0
  },
  "keywordAnalysis": {
    "matchedKeywords": [],
    "missingKeywords": [],
    "keywordCoveragePercentage": 0
  },
  "recruiterInsights": {
    "estimatedReadTime": "",
    "strengths": [],
    "improvements": [],
    "redFlags": []
  }
}

INPUTS:
Target Company: ${company || "Unknown Company"}
Job Description:
${jobDescriptionText}

Resume Data:
${JSON.stringify(resume.parsedData)}
Resume Text:
${resume.extractedText}
`;
          const result = await model.generateContent(prompt);
          const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(responseText);
        };

        const fallback = {
          shortVersion: "AI Cover Letter generation is temporarily unavailable.",
          standardVersion: "AI Cover Letter generation is temporarily unavailable.",
          detailedVersion: "AI Cover Letter generation is temporarily unavailable.",
          score: { overallScore: 0, jdAlignment: 0, keywordCoverage: 0, professionalTone: 0, authenticity: 0, readability: 0, lengthScore: 0 },
          keywordAnalysis: { matchedKeywords: [], missingKeywords: [], keywordCoveragePercentage: 0 },
          recruiterInsights: { estimatedReadTime: "0 min", strengths: [], improvements: [], redFlags: [] }
        };
        const result = await withFallback(operation, fallback, "Cover Letter Generation");

        job.status = "completed";
        job.result = result;
        await job.save();
      } catch (err) {
        job.status = "failed";
        job.error = err.message;
        await job.save();
      }
    })();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Generate optimized resume suggestions
exports.optimizeResume = async (req, res) => {
  try {
    const { resumeId, jobDescriptionText } = req.body;
    
    const job = await Job.create({ userId: req.user._id, jobType: "optimize", status: "processing" });
    res.json({ jobId: job._id, status: "Processing..." });

    (async () => {
      try {
        const resume = await Resume.findById(resumeId);
        if (!resume) throw new Error("Resume not found");

        const operation = async () => {
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
          const prompt = `You are an expert ATS resume optimizer. Review the candidate's resume against the job description and rewrite bullet points to be more impactful and include relevant keywords naturally. Format strictly as a raw JSON object. {"optimizedExperience": [{"original": "...", "optimized": "..."}], "generalTips": ["..."]} Job Description: ${jobDescriptionText} \n Resume Data: ${JSON.stringify(resume.parsedData.experience)}`;
          const result = await model.generateContent(prompt);
          const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(responseText);
        };

        const fallback = { optimizedExperience: [], generalTips: ["AI Optimizer is temporarily unavailable."] };
        const result = await withFallback(operation, fallback, "Resume Optimization");

        job.status = "completed";
        job.result = result;
        await job.save();
      } catch (err) {
        job.status = "failed";
        job.error = err.message;
        await job.save();
      }
    })();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
