export type InterviewStatus = "idle" | "setup" | "in-progress" | "paused" | "completed";

export interface ExtractedSkill {
  name: string;
  normalizedName: string;
  similarity?: number; // 0–1, from vector search
  isNew?: boolean;     // true if similarity < 0.80
}

export interface InterviewQuestion {
  _id: string;
  skillId: string;
  skillName: string;
  question: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface AnswerEntry {
  questionId: string;
  question: string;
  transcript: string;
  durationSecs: number;
  recordedAt: string;
}

export interface InterviewSession {
  _id: string;
  userId: string;
  jdText: string;
  extractedSkills: ExtractedSkill[];
  questions: InterviewQuestion[];
  answers: AnswerEntry[];
  status: InterviewStatus;
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  createdAt: string;
  completedAt?: string;
}

export interface SessionConfig {
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  enableCaptions: boolean;
}
