// ─── Skill Extraction Prompt ────────────────────────────────────────────────
// Version: 1.0
// Model: gemini-2.0-flash-lite
// Purpose: Extract and normalize technical skills from a job description

export const SKILL_EXTRACTION_SYSTEM = `You are a technical recruiter and software engineering expert.
Your job is to analyze job descriptions and extract ONLY the core technical skills required for the role.
Rules:
- Only extract technologies, frameworks, languages, and platforms.
- Ignore soft skills.
- Ignore duplicate technologies.
- Ignore generic terms like "problem solving" or "communication".
- Return skills normalized to common industry naming.
Examples: "React.js" → "React", "NodeJS" → "Node.js", "Amazon Web Services" → "AWS"
Return JSON only.`;

export const SKILL_EXTRACTION_SCHEMA = `{ "skills": [string] }`;

export function buildSkillExtractionPrompt(jdText: string): string {
  return `${SKILL_EXTRACTION_SYSTEM}

Schema: ${SKILL_EXTRACTION_SCHEMA}

Job Description:
${jdText}`;
}
