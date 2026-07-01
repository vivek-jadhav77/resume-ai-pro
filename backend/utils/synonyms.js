










/**
 * A simple dictionary for normalizing common technical skills and handling synonyms.
 */

const SYNONYMS = {
  // AI / ML
  "machine learning": ["ml"],
  "deep learning": ["dl"],
  "large language models": ["llm", "llms"],
  "natural language processing": ["nlp"],
  "artificial intelligence": ["ai"],
  "computer vision": ["cv"],
  "reinforcement learning": ["rl"],

  // APIs & Web
  "rest api": ["rest", "rest apis", "restful api", "restful apis", "api development"],
  "graphql api": ["graphql"],
  "user interface": ["ui"],
  "user experience": ["ux"],

  // Version Control & CI/CD
  "github": ["github actions", "git version control"],
  "gitlab": ["gitlab ci"],
  "ci/cd": ["continuous integration", "continuous deployment", "continuous delivery", "cicd"],

  // Languages & Frameworks
  "javascript": ["js"],
  "typescript": ["ts"],
  "python": ["py"],
  "golang": ["go"],
  "node.js": ["nodejs", "node"],
  "react.js": ["react", "reactjs"],
  "vue.js": ["vue", "vuejs"],
  "next.js": ["nextjs"],
  "tailwind css": ["tailwindcss", "tailwind"],

  // Cloud & DB
  "amazon web services": ["aws"],
  "google cloud platform": ["gcp"],
  "microsoft azure": ["azure"],
  "postgresql": ["postgres"],
  "mongodb": ["mongo"],
  "elasticsearch": ["elastic search"],
};

/**
 * Returns the canonical name for a given skill string if a synonym matches.
 */
const getCanonicalSkill = (skill) => {
  if (!skill) return "";
  const sLower = skill.toLowerCase().trim();

  // Check if it's a primary key
  if (SYNONYMS[sLower]) return sLower;

  // Check if it's in the arrays
  for (const [canonical, aliases] of Object.entries(SYNONYMS)) {
    if (aliases.includes(sLower)) {
      return canonical;
    }
  }

  // If no match, return original lowercase
  return sLower;
};

/**
 * Returns an array of all possible aliases (including the canonical name itself) for a skill.
 */
const getSkillAliases = (skill) => {
  const canonical = getCanonicalSkill(skill);
  if (SYNONYMS[canonical]) {
    return [canonical, ...SYNONYMS[canonical]];
  }
  return [canonical];
};

module.exports = {
  SYNONYMS,
  getCanonicalSkill,
  getSkillAliases
};
