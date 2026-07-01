const ROLE_SKILL_MAPS = {
  "Frontend Developer": [
    "React.js", "Vue.js", "Angular", "TypeScript", "JavaScript", "CSS3", "HTML5", 
    "Tailwind CSS", "Sass", "Responsive Design", "Vite", "Webpack", "Next.js", "Redux", "Framer Motion"
  ],
  "Backend Developer": [
    "Node.js", "Express.js", "Python", "Django", "Flask", "Java", "Spring Boot", 
    "Go", "SQL", "PostgreSQL", "MySQL", "MongoDB", "REST API Design", "GraphQL", 
    "Authentication", "JWT", "OAuth", "Redis", "Docker", "Kubernetes"
  ],
  "Full Stack Developer": [
    "React.js", "Vue.js", "Node.js", "Express.js", "JavaScript", "TypeScript", 
    "MongoDB", "SQL", "PostgreSQL", "REST API Design", "Docker", "AWS", "Git", "CI/CD", 
    "Responsive Design", "Authentication", "JWT", "Next.js"
  ],
  "Data Scientist": [
    "Python", "R", "Pandas", "NumPy", "SQL", "Machine Learning", "Scikit-Learn", 
    "TensorFlow", "PyTorch", "Statistics", "Data Visualization", "Jupyter", "Matplotlib"
  ],
  "AI Engineer": [
    "Python", "LLMs", "RAG", "LangChain", "Vector Databases", "Prompt Engineering", 
    "PyTorch", "Hugging Face", "OpenAI", "Gemini", "Machine Learning", "TensorFlow"
  ],
  "Machine Learning Engineer": [
    "Python", "Machine Learning", "PyTorch", "TensorFlow", "Scikit-Learn", 
    "SQL", "Pandas", "NumPy", "MLOps", "Docker", "Kubernetes", "CUDA"
  ],
  "DevOps Engineer": [
    "Docker", "Kubernetes", "AWS", "Azure", "Terraform", "CI/CD", "Git", 
    "Linux", "Bash", "Python", "Jenkins", "Prometheus", "Grafana", "Ansible"
  ]
};

/**
 * Detects the target role based on Job Title, Job Description text, and required skills list.
 */
const detectRole = (jobTitle, jobDescriptionText, requiredSkills = []) => {
  const titleLower = (jobTitle || "").toLowerCase();
  const descLower = (jobDescriptionText || "").toLowerCase();
  const skillsSet = new Set(requiredSkills.map(s => s.toLowerCase()));

  // 1. Check title first as it's the strongest indicator
  if (titleLower.includes("front") || titleLower.includes("ui") || titleLower.includes("ux")) return "Frontend Developer";
  if (titleLower.includes("back") || titleLower.includes("server") || titleLower.includes("api")) return "Backend Developer";
  if (titleLower.includes("full") || titleLower.includes("mern") || titleLower.includes("stack")) return "Full Stack Developer";
  if (titleLower.includes("data scientist") || titleLower.includes("data science") || titleLower.includes("pandas")) return "Data Scientist";
  if (titleLower.includes("ai") || titleLower.includes("artificial intelligence") || titleLower.includes("prompt") || titleLower.includes("llm") || titleLower.includes("langchain")) return "AI Engineer";
  if (titleLower.includes("machine learning") || titleLower.includes("ml")) return "Machine Learning Engineer";
  if (titleLower.includes("devops") || titleLower.includes("ci/cd") || titleLower.includes("infrastructure") || titleLower.includes("cloud")) return "DevOps Engineer";

  // 2. Check required skills
  if (skillsSet.has("react") || skillsSet.has("react.js") || skillsSet.has("vue") || skillsSet.has("angular") || skillsSet.has("css3")) return "Frontend Developer";
  if (skillsSet.has("express") || skillsSet.has("node") || skillsSet.has("node.js") || skillsSet.has("django") || skillsSet.has("spring boot")) {
    if (skillsSet.has("react") || skillsSet.has("vue")) {
      return "Full Stack Developer";
    }
    return "Backend Developer";
  }
  if (skillsSet.has("llms") || skillsSet.has("langchain") || skillsSet.has("vector databases") || skillsSet.has("prompt engineering")) return "AI Engineer";
  if (skillsSet.has("machine learning") || skillsSet.has("pytorch") || skillsSet.has("tensorflow")) return "Machine Learning Engineer";
  if (skillsSet.has("docker") || skillsSet.has("kubernetes") || skillsSet.has("aws") || skillsSet.has("ci/cd")) return "DevOps Engineer";

  // 3. Fallback based on content keywords
  if (descLower.includes("react") || descLower.includes("angular") || descLower.includes("frontend")) return "Frontend Developer";
  if (descLower.includes("node") || descLower.includes("express") || descLower.includes("backend") || descLower.includes("database design")) return "Backend Developer";
  if (descLower.includes("full stack") || descLower.includes("fullstack")) return "Full Stack Developer";
  if (descLower.includes("data science") || descLower.includes("data scientist")) return "Data Scientist";
  if (descLower.includes("ai engineer") || descLower.includes("large language model") || descLower.includes("llm")) return "AI Engineer";

  return "General Software Engineer";
};

/**
 * Detects the closest standard role mapping and returns its specialized skill list.
 */
const getRoleSkillMap = (roleDetected) => {
  const roleLower = (roleDetected || "").toLowerCase();

  // Try direct matches first
  for (const [key, skills] of Object.entries(ROLE_SKILL_MAPS)) {
    if (roleLower.includes(key.toLowerCase()) || key.toLowerCase().includes(roleLower)) {
      return { matchedRole: key, skills };
    }
  }

  // Try word-by-word intersection matching
  for (const [key, skills] of Object.entries(ROLE_SKILL_MAPS)) {
    const keyWords = key.toLowerCase().split(" ");
    if (keyWords.some(word => word.length > 3 && roleLower.includes(word))) {
      return { matchedRole: key, skills };
    }
  }

  // Default fallback if no role matches
  return { matchedRole: "General Software Engineer", skills: [] };
};

module.exports = {
  ROLE_SKILL_MAPS,
  detectRole,
  getRoleSkillMap
};
