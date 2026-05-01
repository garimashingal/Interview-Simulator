import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Session from "@/lib/db/models/Session";
import Question from "@/lib/db/models/Question";

// GET /api/sessions/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const session = await Session.findById(id)
      .populate<{ questions: { _id: string; question: string; skillName: string; difficulty: string }[] }>(
        "questions", "question skillName difficulty"
      )
      .lean();

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    return NextResponse.json({ session });
  } catch (err) {
    console.error("[Session GET]", err);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}

// PATCH /api/sessions/[id] — Add answer or complete session
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await connectDB();

    const update: Record<string, unknown> = {};
    if (body.answer) {
      update.$push = { answers: body.answer };
    }
    if (body.status) {
      update.$set = { status: body.status };
      if (body.status === "completed") {
        (update.$set as Record<string, unknown>).completedAt = new Date();
      }
    }

    const session = await Session.findByIdAndUpdate(id, update, { new: true });
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Session PATCH]", err);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}
