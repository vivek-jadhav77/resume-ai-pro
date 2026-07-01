const TECH_DICTIONARY = {
  "react": "React.js",
  "react.js": "React.js",
  "node": "Node.js",
  "node.js": "Node.js",
  "express": "Express.js",
  "express.js": "Express.js",
  "mongodb": "MongoDB",
  "mongo": "MongoDB",
  "docker": "Docker",
  "aws": "AWS",
  "amazon web services": "AWS",
  "amber": "Ember.js",
  "ember": "Ember.js",
  "ember.js": "Ember.js",
  "kubernetes": "Kubernetes",
  "k8s": "Kubernetes",
  "typescript": "TypeScript",
  "ts": "TypeScript",
  "javascript": "JavaScript",
  "js": "JavaScript",
  "python": "Python",
  "ruby": "Ruby",
  "rails": "Ruby on Rails",
  "ruby on rails": "Ruby on Rails",
  "php": "PHP",
  "laravel": "Laravel",
  "oracle": "Oracle DB",
  "postgres": "PostgreSQL",
  "postgresql": "PostgreSQL",
  "mysql": "MySQL",
  "redis": "Redis",
  "angular": "Angular",
  "vue": "Vue.js",
  "vue.js": "Vue.js",
  "tailwind": "Tailwind CSS",
  "tailwindcss": "Tailwind CSS",
  "bootstrap": "Bootstrap",
  "sass": "Sass",
  "html": "HTML5",
  "html5": "HTML5",
  "css": "CSS3",
  "css3": "CSS3",
  "git": "Git",
  "github": "GitHub",
  "ci/cd": "CI/CD",
  "graphql": "GraphQL",
  "rest": "REST API Design",
  "rest api": "REST API Design",
  "restful": "REST API Design",
  "nest": "NestJS",
  "nestjs": "NestJS",
  "django": "Django",
  "flask": "Flask",
  "spring": "Spring Boot",
  "spring boot": "Spring Boot",
  "nextjs": "Next.js",
  "next.js": "Next.js",
  "java": "Java",
  "kotlin": "Kotlin",
  "swift": "Swift",
  "flutter": "Flutter",
  "react native": "React Native",
  "c#": "C#",
  ".net": ".NET",
  "dotnet": ".NET"
};

const STOP_WORDS = new Set([
  "the", "and", "a", "developer", "engineer", "senior", "junior", "lead", 
  "experience", "years", "skills", "tools", "team", "project", "work", 
  "highly", "ability", "excellent", "with", "using", "building", "design", "development"
]);

/**
 * Validates and normalizes a single skill keyword.
 * Returns the normalized name, or null if it's not a valid technology.
 */
const validateAndNormalizeSkill = (skill) => {
  if (!skill) return null;
  const cleanSkill = skill.trim().toLowerCase();

  // Filter out stop words
  if (STOP_WORDS.has(cleanSkill)) return null;

  // Direct dictionary match
  if (TECH_DICTIONARY[cleanSkill]) {
    return TECH_DICTIONARY[cleanSkill];
  }

  // Filter out pure numbers or very short strings (single letters other than C, R, Go)
  if (skill.length <= 1 && !["c", "r"].includes(cleanSkill)) {
    return null;
  }
  if (/^[0-9]+$/.test(cleanSkill)) {
    return null;
  }

  // Title-case capitalization for fallback
  return skill
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Validates and normalizes an array of skills, returning unique valid skills.
 */
const validateAndNormalizeSkills = (skillsArray) => {
  if (!skillsArray || !Array.isArray(skillsArray)) return [];
  
  const uniqueNormalized = new Set();
  skillsArray.forEach(skill => {
    const normalized = validateAndNormalizeSkill(skill);
    if (normalized) {
      uniqueNormalized.add(normalized);
    }
  });

  return Array.from(uniqueNormalized);
};

module.exports = {
  validateAndNormalizeSkill,
  validateAndNormalizeSkills
};
