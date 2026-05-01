import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  const key = process.env.GOOGLE_AI_API_KEY;

  if (!key) {
    return NextResponse.json({ status: "KEY_NOT_SET" }, { status: 500 });
  }

  // Make a minimal live test call
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent("Say: ok");
    const text = result.response.text();
    return NextResponse.json({
      status: "OK",
      keyPrefix: key.slice(0, 10) + "...",
      response: text.slice(0, 50),
    });
  } catch (err: unknown) {
    return NextResponse.json({
      status: "ERROR",
      keyPrefix: key.slice(0, 10) + "...",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
