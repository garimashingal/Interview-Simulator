import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISkill extends Document {
  name: string;
  normalizedName: string;
  category: string;
  embedding: number[];
  questionCount: number;
  createdAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name:           { type: String, required: true },
    normalizedName: { type: String, required: true, unique: true, index: true },
    category:       { type: String, default: "general" },
    embedding:      { type: [Number], required: true },
    questionCount:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Skill: Model<ISkill> = mongoose.models.Skill || mongoose.model<ISkill>("Skill", SkillSchema);
export default Skill;
