const { genAI, withFallback } = require("../utils/aiHelper");
const { BENCHMARK_SKILL_MAPS } = require("./benchmarkEngine");

/**
 * Deterministic fallback to extract skills if Gemini API fails.
 */
const deterministicSkillExtraction = (jdText) => {
  const textLower = jdText.toLowerCase();
  const extractedSkills = new Set();

  // Combine all benchmark skills into a single flat array
  const commonTechSkills = [];
  Object.values(BENCHMARK_SKILL_MAPS).forEach(skillsArray => {
    skillsArray.forEach(s => commonTechSkills.push(s));
  });

  // Additional common skills for fallback
  const fallbackDictionary = [
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Linux", "Java", "C++", 
    "C#", ".NET", "Ruby", "PHP", "Go", "Rust", "Swift", "Kotlin", "Android", "iOS",
    "Tailwind CSS", "GraphQL", "REST API", "CI/CD", "Jenkins", "Git", "MySQL", 
    "PostgreSQL", "Oracle", "Redis", "Elasticsearch", "Kafka", "Spring Boot", "Django", "Flask"
  ];

  const fullDictionary = [...new Set([...commonTechSkills, ...fallbackDictionary])];

  fullDictionary.forEach(skill => {
    // Escape special characters for regex
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Boundary check
    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
    if (regex.test(textLower)) {
      extractedSkills.add(skill);
    }
  });

  // Since we don't have LLM context, we put everything in requiredSkills
  // Benchmark engine will sort out the rest later.
  return {
    requiredSkills: Array.from(extractedSkills),
    preferredSkills: [],
    optionalSkills: []
  };
};

/**
 * Parses Job Description text and categorizes skills.
 */
const parseJobDescription = async (jdText) => {
  if (!jdText) {
    return { requiredSkills: [], preferredSkills: [], optionalSkills: [] };
  }

  const operation = async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert ATS (Applicant Tracking System) parser. Your job is to analyze the following Job Description text, extract all technical skills, technologies, tools, and methodologies, and classify them into three categories:
      1. requiredSkills: Skills explicitly listed under "Required", "Must Have", "Basic Qualifications", or described as core day-to-day duties. **CRITICAL: Only place truly mandatory skills here.**
      2. preferredSkills: Skills listed under "Preferred", "Nice to Have", "Desired", "Bonus Qualifications", or pluses. **CRITICAL: Move tools such as Git, GitHub, Docker, Kubernetes, JIRA, Agile, Postman to preferredSkills UNLESS they are explicitly required as core to the role.**
      3. optionalSkills: Supplementary, tertiary tools, or secondary technologies that are nice to have but not central to the primary duties.

      Job Description:
      ${jdText}

      Format your response strictly as a raw JSON object. Do not include markdown like \`\`\`json.
      {
        "requiredSkills": ["React", "JavaScript", "HTML", "CSS"],
        "preferredSkills": ["TypeScript", "Tailwind CSS"],
        "optionalSkills": ["Ruby", "PHP", "Oracle"]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(responseText);
  };

  const fallback = deterministicSkillExtraction(jdText);

  return await withFallback(operation, fallback, "JD Semantic Parsing");
};

module.exports = {
  parseJobDescription
};
