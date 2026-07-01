const path = require('path');
require('dotenv').config();

const { parseJobDescription } = require('./services/jobDescriptionParser');
const { detectRole, getRoleSkillMap } = require('./services/roleIntelligence');
const { validateAndNormalizeSkills } = require('./services/skillValidation');
const { enrichSkillsWithBenchmarks } = require('./services/benchmarkEngine');
const { calculateScoreBreakdown } = require('./services/scoringEngine');
const { analyzeResumeWithGemini } = require('./services/aiService');

const mockResumeText = `
John Doe
Email: john.doe@example.com
Phone: (123) 456-7890

Summary:
Experienced Full Stack Developer with 4 years of experience building scalable web applications. Strong expertise in JavaScript, React, Node.js, Express, and MongoDB.

Skills:
React, Node.js, Express, MongoDB, JavaScript, HTML, CSS, Git

Experience:
Software Engineer at TechCorp (2022 - Present)
- Developed responsive web applications using React.js and Node.js.
- Integrated REST APIs and designed database schemas in MongoDB.
- Improved frontend performance by 25%.

Projects:
E-commerce Platform
- Built a full-stack e-commerce app using React, Node.js, and Express.
- Implemented user authentication and payment processing.
`;

const mockParsedData = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "(123) 456-7890",
  skills: ["React", "Node.js", "Express", "MongoDB", "JavaScript", "HTML", "CSS", "Git"],
  education: [],
  experience: [
    {
      company: "TechCorp",
      role: "Software Engineer",
      years: "2022 - Present",
      description: "Developed responsive web applications using React.js and Node.js. Integrated REST APIs and designed database schemas in MongoDB. Improved frontend performance by 25%."
    }
  ],
  projects: [
    {
      title: "E-commerce Platform",
      description: "Built a full-stack e-commerce app using React, Node.js, and Express. Implemented user authentication and payment processing."
    }
  ],
  certifications: []
};

const mockJobDescription = `
Role: Frontend Developer
We are looking for a Frontend Developer to join our team. 

Key Responsibilities:
- Design and develop scalable frontend web applications.
- Optimize application performance and responsiveness.

Required Skills:
- Strong experience with React, HTML, CSS.
- Production experience with Tailwind CSS.
- Knowledge of TypeScript or Next.js is a plus.
`;

const runTest = async () => {
  console.log("Running ATS scanner pipeline test...");
  try {
    // 1. Semantic JD Parsing: Extract skills into required/preferred/optional
    const parsedJd = await parseJobDescription(mockJobDescription);
    console.log("1. Parsed JD Skills:", parsedJd);

    // 2. Validate & Normalize Skills
    const normalizedJdSkills = {
      critical: validateAndNormalizeSkills(parsedJd.requiredSkills || []),
      important: validateAndNormalizeSkills(parsedJd.preferredSkills || []),
      optional: validateAndNormalizeSkills(parsedJd.optionalSkills || [])
    };
    console.log("2. Normalized JD Skills:", normalizedJdSkills);

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

    // 3. Dynamic Role Detection
    const roleDetected = detectRole("Frontend Developer", mockJobDescription, normalizedJdSkills.critical);
    console.log("3. Role Detected:", roleDetected);
    const { matchedRole } = getRoleSkillMap(roleDetected);

    // 4. Industry Benchmark Enrichment
    const enrichedJdSkills = enrichSkillsWithBenchmarks(roleDetected, normalizedJdSkills);
    console.log("4. Enriched JD Skills (with Benchmarks):", enrichedJdSkills);

    // 5. Deterministic Score & Confidence math in JavaScript
    const scoringResult = calculateScoreBreakdown(
      mockParsedData,
      roleDetected,
      enrichedJdSkills,
      mockJobDescription,
      rawJdSkillsCount,
      normalizedJdSkillsCount,
      matchedRole
    );
    console.log("5. Scoring Result:\n", JSON.stringify(scoringResult, null, 2));

    // 6. Gemini Semantic suggestions (purely for copy writing recommendations/strengths)
    const aiResult = await analyzeResumeWithGemini(
      mockResumeText,
      mockParsedData,
      scoringResult.matchedSkills,
      scoringResult.criticalMissingSkills,
      scoringResult.importantMissingSkills,
      scoringResult.optionalSkills,
      roleDetected
    );
    console.log("6. AI Copypresentation Results:\n", JSON.stringify(aiResult, null, 2));

  } catch (error) {
    console.error("Test failed:", error);
  }
};

runTest();
