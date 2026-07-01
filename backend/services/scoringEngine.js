const { validateAndNormalizeSkills } = require("./skillValidation");

/**
 * Calculates the deterministic ATS score and breakdowns based on candidate data and job requirements.
 * 
 * Weights:
 * - Skills Match: 40% (Critical: 25, Important: 10, Optional: 5)
 * - Projects Relevance: 25%
 * - Experience Relevance: 20%
 * - Education Match: 10%
 * - Resume Quality: 5%
 */
const calculateScoreBreakdown = (parsedData, roleDetected, jdSkills, jdText, rawJdSkillsCount, normalizedJdSkillsCount, matchedRole, extractedText) => {
  const { getSkillAliases } = require("../utils/synonyms");

  // Helper to deep search a skill in resume text and parsed data
  const isSkillPresent = (skill) => {
    const aliases = getSkillAliases(skill);
    
    // Check explicit skills array
    const explicitSkills = (parsedData.skills || []).map(s => s.toLowerCase());
    if (aliases.some(alias => explicitSkills.includes(alias))) return true;

    // Check raw text
    const rawLower = (extractedText || "").toLowerCase();
    if (aliases.some(alias => {
      // Use boundary regex to avoid partial word matches
      const regex = new RegExp(`\\b${alias.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'i');
      return regex.test(rawLower);
    })) return true;

    // Check projects and experience description
    const expText = (parsedData.experience || []).map(e => (e.description + " " + e.role).toLowerCase()).join(" ");
    const projText = (parsedData.projects || []).map(p => (p.description + " " + p.title).toLowerCase()).join(" ");
    const combined = expText + " " + projText;

    if (aliases.some(alias => {
      const regex = new RegExp(`\\b${alias.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'i');
      return regex.test(combined);
    })) return true;

    return false;
  };

  // 1. Skill Categories Matching (Deep Parse)
  const jdCritical = jdSkills.critical || [];
  const jdImportant = jdSkills.important || [];
  const jdOptional = jdSkills.optional || [];

  const matchedCritical = [];
  const missingCritical = [];
  jdCritical.forEach(skill => {
    if (isSkillPresent(skill)) matchedCritical.push(skill);
    else missingCritical.push(skill);
  });

  const matchedImportant = [];
  const missingImportant = [];
  jdImportant.forEach(skill => {
    if (isSkillPresent(skill)) matchedImportant.push(skill);
    else missingImportant.push(skill);
  });

  const matchedOptional = [];
  const missingOptional = [];
  jdOptional.forEach(skill => {
    if (isSkillPresent(skill)) matchedOptional.push(skill);
    else missingOptional.push(skill);
  });

  // Calculate skill category scores (out of 40 total)
  // Critical: up to 25 pts, Important: up to 10 pts, Optional: up to 5 pts
  let skillsScore = 0;
  
  if (jdCritical.length > 0) skillsScore += (matchedCritical.length / jdCritical.length) * 25;
  else skillsScore += 25;

  if (jdImportant.length > 0) skillsScore += (matchedImportant.length / jdImportant.length) * 10;
  else skillsScore += 10;

  // Optional skills are treated as bonus if missing them shouldn't penalize harshly,
  // but to fit the 40pt cap, we'll scale them to 5 pts.
  if (jdOptional.length > 0) skillsScore += (matchedOptional.length / jdOptional.length) * 5;
  else skillsScore += 5;

  skillsScore = Math.round(skillsScore);

  // 2. Experience Relevance Score (out of 20)
  let experienceScore = 0;
  const experienceList = parsedData.experience || [];
  let totalYears = 0;
  experienceList.forEach(exp => {
    let years = 1.0;
    if (exp.years) {
      const match = exp.years.match(/(\\d{4})\\s*-\\s*(\\d{4}|Present)/i);
      if (match) {
        const start = parseInt(match[1]);
        const end = match[2].toLowerCase() === 'present' ? new Date().getFullYear() : parseInt(match[2]);
        years = Math.max(0.5, end - start);
      }
    }
    totalYears += years;
  });

  if (totalYears >= 5) experienceScore = 20;
  else if (totalYears >= 3) experienceScore = 17;
  else if (totalYears >= 1) experienceScore = 14;
  else if (totalYears > 0) experienceScore = 10;
  else experienceScore = 5;

  let hasRoleMatch = false;
  const roleLower = (roleDetected || "").toLowerCase();
  experienceList.forEach(exp => {
    const expRoleLower = (exp.role || "").toLowerCase();
    if (roleLower && (expRoleLower.includes(roleLower) || roleLower.split(" ").some(w => w.length > 3 && expRoleLower.includes(w)))) {
      hasRoleMatch = true;
    }
  });

  if (!hasRoleMatch && experienceList.length > 0) {
    experienceScore = Math.round(experienceScore * 0.85);
  }

  // 3. Projects Relevance Score (out of 25)
  let projectsScore = 0;
  const projectsList = parsedData.projects || [];
  if (projectsList.length > 0) {
    let baseProj = Math.min(15, projectsList.length * 5);
    let matchedTechCount = 0;
    const allJdSkills = [...jdCritical, ...jdImportant];
    projectsList.forEach(proj => {
      const desc = (proj.description || "").toLowerCase();
      const title = (proj.title || "").toLowerCase();
      allJdSkills.forEach(skill => {
        const aliases = getSkillAliases(skill);
        if (aliases.some(a => desc.includes(a) || title.includes(a))) {
          matchedTechCount++;
        }
      });
    });
    const techBonus = Math.min(10, matchedTechCount * 2);
    projectsScore = Math.round(baseProj + techBonus);
  }

  // 4. Education Match (out of 10)
  let educationScore = 0;
  const eduList = parsedData.education || [];
  if (eduList.length > 0) {
    // Basic check for degrees
    const hasDegree = eduList.some(e => e.degree && (e.degree.toLowerCase().includes("bachelor") || e.degree.toLowerCase().includes("master") || e.degree.toLowerCase().includes("phd") || e.degree.toLowerCase().includes("b.s") || e.degree.toLowerCase().includes("b.a") || e.degree.toLowerCase().includes("bsc")));
    educationScore = hasDegree ? 10 : 7;
  } else {
    educationScore = 3;
  }

  // 5. Resume Quality Score (out of 5)
  let qualityScore = 0;
  if (parsedData.name) qualityScore += 1;
  if (parsedData.email || parsedData.phone) qualityScore += 1;
  if (parsedData.skills && parsedData.skills.length > 0) qualityScore += 1;
  if (parsedData.experience && parsedData.experience.length > 0) qualityScore += 1;
  if (parsedData.projects && parsedData.projects.length > 0) qualityScore += 1;

  // 6. Overall ATS Score calculation
  const atsScore = Math.max(0, Math.min(100, Math.round(skillsScore + experienceScore + projectsScore + educationScore + qualityScore)));

  // Determine Score Band
  let scoreBand = "Weak Match";
  if (atsScore >= 90) scoreBand = "Excellent Match";
  else if (atsScore >= 75) scoreBand = "Strong Match";
  else if (atsScore >= 60) scoreBand = "Moderate Match";

  // Combine all matched skills
  const matchedSkills = [...matchedCritical, ...matchedImportant, ...matchedOptional];

  // 7. Analysis Quality logic (replacing Confidence percentage)
  let analysisQuality = "Moderate";
  let jdQuality = Math.min(100, Math.round(((jdText || "").length / 500) * 100));
  let skillExtractionRatio = rawJdSkillsCount > 0 ? (normalizedJdSkillsCount / rawJdSkillsCount) * 100 : 100;
  
  if (jdQuality > 80 && skillExtractionRatio > 80 && (parsedData.experience || []).length > 0) {
    analysisQuality = "Excellent";
  } else if (jdQuality > 50 && skillExtractionRatio > 50) {
    analysisQuality = "High";
  }

  return {
    atsScore,
    scoreBand,
    analysisQuality,
    scoreBreakdown: {
      skills: skillsScore,
      experience: experienceScore,
      projects: projectsScore,
      education: educationScore,
      quality: qualityScore
    },
    matchedSkills,
    criticalMissingSkills: missingCritical,
    importantMissingSkills: missingImportant,
    optionalSkills: missingOptional
  };
};

module.exports = {
  calculateScoreBreakdown
};


