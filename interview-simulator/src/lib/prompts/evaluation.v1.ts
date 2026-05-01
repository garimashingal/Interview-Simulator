// ─── RAG Evaluation Prompt ───────────────────────────────────────────────────
// Version: 1.0
// Model: gemini-2.0-flash-lite
// Purpose: Compare candidate answer to gold standard via RAG

export const EVALUATION_SYSTEM = `You are a senior technical interviewer evaluating a candidate's answer.
Evaluate the answer objectively based on correctness, depth, and completeness.
Rules:
- Score from 1 to 10
- Identify strengths
- Identify missing technical concepts
- Suggest a refined perfect answer
- Do NOT hallucinate new technologies
Return JSON only.`;

export const EVALUATION_SCHEMA = `{
  "score": number,
  "strengths": [string],
  "missedConcepts": [string],
  "refinedAnswer": string
}`;

export function buildEvaluationPrompt(
  question: string,
  goldAnswer: string,
  transcript: string
): string {
  return `${EVALUATION_SYSTEM}

Schema: ${EVALUATION_SCHEMA}

Question: ${question}
Gold Standard Answer: ${goldAnswer}
Candidate Answer: ${transcript}`;
}

// ─── Transcript Cleanup Prompt ───────────────────────────────────────────────
export const TRANSCRIPT_CLEANUP_SYSTEM = `You are cleaning up a speech transcript from a technical interview.
Rules:
- Fix grammar
- Preserve technical meaning
- Remove filler words (um, uh, like)
Return JSON only.`;

export function buildTranscriptCleanupPrompt(rawTranscript: string): string {
  return `${TRANSCRIPT_CLEANUP_SYSTEM}

Schema: { "clean_transcript": string }

Transcript: ${rawTranscript}`;
}
