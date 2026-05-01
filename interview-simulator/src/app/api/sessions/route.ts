import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Session from "@/lib/db/models/Session";
import Question from "@/lib/db/models/Question";
import Skill from "@/lib/db/models/Skill";
import { generateEmbedding, generateEmbeddings } from "@/lib/ai/embedding";
import { geminiFlash } from "@/lib/ai/gemini";
import { buildQuestionGenerationPrompt } from "@/lib/prompts/questionGeneration.v1";
import type { ExtractedSkill, SessionConfig } from "@/types/interview";
import mongoose from "mongoose";

// POST /api/sessions — Create a new interview session
export async function POST(req: NextRequest) {
  try {
    const { jdText, skills, config } = (await req.json()) as {
      jdText: string;
      skills: ExtractedSkill[];
      config: SessionConfig;
    };

    await connectDB();

    // For each skill: fetch or generate questions
    const questionIds: mongoose.Types.ObjectId[] = [];

    for (const skill of skills) {
      if (skill.isNew) {
        // Generate questions for new skill via Gemini
        const prompt = buildQuestionGenerationPrompt(skill.normalizedName, 10);
        const result = await geminiFlash.generateContent(prompt);
        const parsed = JSON.parse(result.response.text()) as {
          questions: { question: string; gold_answer: string; difficulty: string }[];
        };

        // Save new skill + questions to DB
        let skillDoc = await Skill.findOne({ normalizedName: skill.normalizedName });
        if (!skillDoc) {
          const skillEmbedding = await generateEmbedding(skill.normalizedName);
          skillDoc = await Skill.create({
            name: skill.name,
            normalizedName: skill.normalizedName,
            embedding: skillEmbedding,
            category: "general",
            questionCount: parsed.questions.length,
          });
        }

        const questionTexts = parsed.questions.map((q) => q.question);
        const embeddings = await generateEmbeddings(questionTexts);

        const docs = await Question.insertMany(
          parsed.questions.map((q, i) => ({
            skillId: skillDoc!._id,
            skillName: skill.normalizedName,
            question: q.question,
            goldAnswer: q.gold_answer,
            embedding: embeddings[i],
            difficulty: (q.difficulty as "easy" | "medium" | "hard") ?? "medium",
            source: "generated",
          }))
        );
        questionIds.push(...docs.map((d) => d._id as mongoose.Types.ObjectId));
      } else {
        // Fetch existing questions for this skill
        const existing = await Question.find({ skillName: skill.normalizedName })
          .limit(config.questionCount)
          .select("_id");
        questionIds.push(...existing.map((q) => q._id as mongoose.Types.ObjectId));
      }
    }

    // Trim to config.questionCount
    const selectedIds = questionIds.slice(0, config.questionCount);

    // Create session (userId placeholder — real auth needed)
    const session = await Session.create({
      userId: new mongoose.Types.ObjectId(), // TODO: Replace with real userId from session
      jdText,
      extractedSkills: skills,
      questions: selectedIds,
      status: "in-progress",
      difficulty: config.difficulty,
      questionCount: config.questionCount,
    });

    return NextResponse.json({ sessionId: session._id.toString() });
  } catch (err) {
    console.error("[Sessions POST]", err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

// GET /api/sessions — List all sessions (for history dashboard)
export async function GET() {
  try {
    await connectDB();
    const sessions = await Session.find({}).sort({ createdAt: -1 }).limit(20).lean();
    return NextResponse.json({ sessions });
  } catch (err) {
    console.error("[Sessions GET]", err);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}
