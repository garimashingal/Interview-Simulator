import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuestion extends Document {
  skillId: mongoose.Types.ObjectId;
  skillName: string;
  question: string;
  goldAnswer: string;
  embedding: number[];
  difficulty: "easy" | "medium" | "hard";
  source: "generated" | "curated";
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    skillId:    { type: Schema.Types.ObjectId, ref: "Skill", required: true, index: true },
    skillName:  { type: String, required: true },
    question:   { type: String, required: true },
    goldAnswer: { type: String, required: true },
    embedding:  { type: [Number], required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    source:     { type: String, enum: ["generated", "curated"], default: "generated" },
  },
  { timestamps: true }
);

const Question: Model<IQuestion> =
  mongoose.models.Question || mongoose.model<IQuestion>("Question", QuestionSchema);
export default Question;
