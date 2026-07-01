const BENCHMARK_SKILL_MAPS = {
  "Frontend Developer": [
    "React.js",
    "JavaScript",
    "TypeScript",
    "HTML5",
    "CSS3",
    "Git"
  ],
  "Backend Developer": [
    "Node.js",
    "Express.js",
    "REST API Design",
    "Authentication",
    "SQL",
    "MongoDB"
  ],
  "Full Stack Developer": [
    "React.js",
    "Node.js",
    "Express.js",
    "MongoDB",
    "REST API Design",
    "Git"
  ],
  "Data Scientist": [
    "Python",
    "Pandas",
    "NumPy",
    "SQL",
    "Machine Learning"
  ],
  "AI Engineer": [
    "Python",
    "LLMs",
    "Prompt Engineering",
    "RAG",
    "LangChain",
    "Vector Databases"
  ]
};

/**
 * Enriches the validated and normalized JD skills with missing industry-standard
 * benchmark competencies based on the detected target role.
 */
const enrichSkillsWithBenchmarks = (roleDetected, normalizedJdSkills) => {
  const enriched = {
    critical: [...(normalizedJdSkills.critical || [])],
    important: [...(normalizedJdSkills.important || [])],
    optional: [...(normalizedJdSkills.optional || [])]
  };

  const benchmarkSkills = BENCHMARK_SKILL_MAPS[roleDetected] || [];
  if (benchmarkSkills.length === 0) {
    return enriched;
  }

  // Create lowercase set of all currently extracted JD skills
  const currentSkillsLower = new Set([
    ...enriched.critical.map(s => s.toLowerCase()),
    ...enriched.important.map(s => s.toLowerCase()),
    ...enriched.optional.map(s => s.toLowerCase())
  ]);

  // Proactively inject benchmark skills if they were not extracted from the JD text.
  // We place these under "important" (preferred) to make the JD more comprehensive.
  benchmarkSkills.forEach(skill => {
    if (!currentSkillsLower.has(skill.toLowerCase())) {
      enriched.important.push(skill);
    }
  });

  return enriched;
};

module.exports = {
  BENCHMARK_SKILL_MAPS,
  enrichSkillsWithBenchmarks
};
