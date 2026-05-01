import { NextRequest, NextResponse } from "next/server";
import { geminiFlash } from "@/lib/ai/gemini";
import connectDB from "@/lib/db/mongodb";
import Question from "@/lib/db/models/Question";
import { buildEvaluationPrompt, buildTranscriptCleanupPrompt } from "@/lib/prompts/evaluation.v1";
import type { EvaluationResult } from "@/types/evaluation";

export async function POST(req: NextRequest) {
  try {
    const { questionId, transcript, sessionId } = await req.json();
    if (!questionId || !transcript) {
      return NextResponse.json({ error: "Missing questionId or transcript" }, { status: 400 });
    }

    await connectDB();

    // Fetch question + gold answer
    const question = await Question.findById(questionId).lean();
    if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

    // Step 1: Clean transcript
    const cleanPrompt = buildTranscriptCleanupPrompt(transcript);
    const cleanResult = await geminiFlash.generateContent(cleanPrompt);
    const { clean_transcript } = JSON.parse(cleanResult.response.text()) as { clean_transcript: string };

    // Step 2: RAG evaluation
    const evalPrompt = buildEvaluationPrompt(question.question, question.goldAnswer, clean_transcript);
    const evalResult = await geminiFlash.generateContent(evalPrompt);
    const evaluation = JSON.parse(evalResult.response.text()) as {
      score: number;
      strengths: string[];
      missedConcepts: string[];
      refinedAnswer: string;
    };

    const result: EvaluationResult = {
      questionId,
      question: question.question,
      transcript: clean_transcript,
      score: evaluation.score,
      strengths: evaluation.strengths,
      missedConcepts: evaluation.missedConcepts,
      refinedAnswer: evaluation.refinedAnswer,
    };

    return NextResponse.json({ evaluation: result });
  } catch (err) {
    console.error("[Evaluate]", err);
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }
}
