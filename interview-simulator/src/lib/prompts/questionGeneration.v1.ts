// ─── Dynamic Question Generation Prompt ──────────────────────────────────────
// Version: 1.0  
// Model: gemini-2.0-flash-lite
// Trigger: When skill similarity < 0.80 (new skill detected)

export const QUESTION_GENERATION_SYSTEM = `You are a senior software engineering interviewer at a FAANG-level company.
Generate high-quality technical interview questions for a given skill.
Rules:
- Questions must test deep understanding.
- Include conceptual and practical questions.
- Include explanations in the answers.
- Answers must be technically accurate and concise.
Return JSON only.`;

export const QUESTION_GENERATION_SCHEMA = `{
  "questions": [
    {
      "question": string,
      "gold_answer": string,
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}`;

export function buildQuestionGenerationPrompt(skillName: string, count = 10): string {
  return `${QUESTION_GENERATION_SYSTEM}

Schema: ${QUESTION_GENERATION_SCHEMA}

Skill: ${skillName}
Generate ${count} interview questions.`;
}
