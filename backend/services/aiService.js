const { genAI, withFallback } = require("../utils/aiHelper");

exports.extractResumeData = async (rawText) => {
  const operation = async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert resume parser. Extract the following information from the provided resume text and return it strictly as a JSON object.
      Do not include any Markdown formatting, like \`\`\`json. Return only the raw JSON object.

      {
        "name": "Full Name",
        "email": "Email Address",
        "phone": "Phone Number",
        "skills": ["Skill 1", "Skill 2"],
        "education": [
          { "institution": "University Name", "degree": "Degree", "years": "Start - End" }
        ],
        "experience": [
          { "company": "Company Name", "role": "Job Title", "years": "Start - End", "description": "Brief description" }
        ],
        "projects": [
          { "title": "Project Name", "description": "Brief description" }
        ],
        "certifications": ["Cert 1"]
      }

      Resume Text:
      ${rawText}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(responseText);
  };

  const fallback = {
    name: "Unknown Candidate",
    email: "",
    phone: "",
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: []
  };

  return await withFallback(operation, fallback, "Resume Data Extraction");
};

exports.analyzeResumeWithGemini = async (resumeText, parsedData, matchedSkills, criticalMissingSkills, importantMissingSkills, optionalSkills, roleDetected) => {
  const operation = async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert technical recruiter and resume consultant.
      Analyze the candidate's resume (both raw text and structured data) based on the target role and matched/missing technical skills.
      
      Target Role: ${roleDetected}
      
      Candidate Matched Skills (skills they have that are relevant to the role):
      ${JSON.stringify(matchedSkills)}
      
      Candidate Critical Missing Skills (skills required for the role but missing from the resume):
      ${JSON.stringify(criticalMissingSkills)}
      
      Candidate Important Missing Skills (important skills missing):
      ${JSON.stringify(importantMissingSkills)}
      
      Candidate Optional Missing Skills (nice-to-have skills missing):
      ${JSON.stringify(optionalSkills)}
      
      Resume Raw Text:
      ${resumeText}
      
      Resume Parsed Data (JSON structure containing experiences, projects, and skills):
      ${JSON.stringify(parsedData)}

      Task:
      Generate:
      1. executiveSummary: A concise, recruiter-style summary (2-3 sentences) covering overall candidate fit, key strengths, major gaps, and a hiring recommendation.
      2. missingSkillExplanations: For EACH skill listed in "Candidate Critical Missing Skills" and "Candidate Important Missing Skills", provide a 1-sentence explanation of why it matters for this specific role. Format as an array of objects: [{"skill": "Skill Name", "reason": "Why it matters..."}].
      3. strengths: List 3 key professional strengths of this candidate that make them a good fit for this role.
      4. suggestions: List 3-5 professional, highly actionable recruiter recommendations to improve the ATS score.
         - CRITICAL: Generate role-specific recommendations tailored to the Target Role.
         - CRITICAL: Focus entirely on skills, projects, technologies, and experience gaps.
         - CRITICAL: Avoid generic formatting advice (e.g., "categorize skills better", "use action verbs").
         - Prioritize the top improvements that would most increase the candidate's ATS score.
         - Good Example (Full Stack): "Add React.js, Node.js, and Express.js project experience. Demonstrate authentication and REST API development."
         - Good Example (AI/ML): "Add PyTorch experience. Include model deployment examples and demonstrate cloud-based ML workflows."

      Format your response strictly as a raw JSON object. Do not include markdown like \`\`\`json.
      {
        "executiveSummary": "Strong candidate for Frontend roles with practical experience in React and UI/UX. Improving backend API integration experience would further strengthen the profile.",
        "missingSkillExplanations": [
          {"skill": "Node.js", "reason": "Essential for building the backend services required by this role."}
        ],
        "strengths": [
          "Demonstrates strong experience in React and modular components design.",
          "Good track record of performance optimization on the frontend."
        ],
        "suggestions": [
          "Include specific achievements or metrics in your experiences to highlight impact."
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(responseText);
  };

  const fallback = {
    executiveSummary: "AI analysis is temporarily unavailable. Core ATS scoring was completed successfully.",
    missingSkillExplanations: [],
    strengths: [],
    suggestions: [],
    fallbackNotice: "AI recommendations are temporarily unavailable."
  };

  return await withFallback(operation, fallback, "Semantic Resume Analysis");
};
