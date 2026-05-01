export interface Skill {
  _id: string;
  name: string;
  normalizedName: string;
  category: string;
  embedding?: number[];
  questionCount: number;
  createdAt: string;
}

export interface SkillLibraryItem {
  skillId: string;
  name: string;
  similarity: number;
  isNew: boolean;
}
