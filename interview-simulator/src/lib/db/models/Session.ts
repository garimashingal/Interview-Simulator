import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnswerEntry {
  questionId: mongoose.Types.ObjectId;
  question: string;
  transcript: string;
  durationSecs: number;
  recordedAt: Date;
}

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  jdText: string;
  extractedSkills: Array<{ name: string; normalizedName: string; isNew: boolean; similarity: number }>;
  questions: mongoose.Types.ObjectId[];
  answers: IAnswerEntry[];
  status: "idle" | "setup" | "in-progress" | "paused" | "completed";
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  createdAt: Date;
  completedAt?: Date;
}

const AnswerEntrySchema = new Schema<IAnswerEntry>({
  questionId:   { type: Schema.Types.ObjectId, ref: "Question", required: true },
  question:     { type: String, required: true },
  transcript:   { type: String, required: true },
  durationSecs: { type: Number, default: 0 },
  recordedAt:   { type: Date, default: Date.now },
});

const SessionSchema = new Schema<ISession>(
  {
    userId:  { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jdText:  { type: String, required: true },
    extractedSkills: [
      {
        name:           String,
        normalizedName: String,
        isNew:          Boolean,
        similarity:     Number,
      },
    ],
    questions:    [{ type: Schema.Types.ObjectId, ref: "Question" }],
    answers:      [AnswerEntrySchema],
    status:       { type: String, enum: ["idle","setup","in-progress","paused","completed"], default: "setup" },
    difficulty:   { type: String, enum: ["easy","medium","hard"], default: "medium" },
    questionCount:{ type: Number, default: 5 },
    completedAt:  { type: Date },
  },
  { timestamps: true }
);

const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);
export default Session;
