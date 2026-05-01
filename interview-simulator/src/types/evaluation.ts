export interface EvaluationResult {
  questionId: string;
  question: string;
  transcript: string;
  score: number;           // 1–10
  strengths: string[];
  missedConcepts: string[];
  refinedAnswer: string;
}

export interface SessionEvaluation {
  _id: string;
  sessionId: string;
  overallScore: number;    // average of all question scores
  results: EvaluationResult[];
  skillBreakdown: SkillScore[];
  createdAt: string;
}

export interface SkillScore {
  skillName: string;
  score: number;           // 1–10
  questionCount: number;
}
