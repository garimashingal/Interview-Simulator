import { NextRequest, NextResponse } from "next/server";
import { geminiFlash } from "@/lib/ai/gemini";
import { buildSkillExtractionPrompt } from "@/lib/prompts/skillExtraction.v1";
import type { ExtractedSkill } from "@/types/interview";

export async function POST(req: NextRequest) {
  try {
    const { jdText } = await req.json();
    if (!jdText || jdText.trim().length < 50) {
      return NextResponse.json({ error: "Job description is too short" }, { status: 400 });
    }

    // Step 1: Extract skills via Gemini (single API call)
    const prompt = buildSkillExtractionPrompt(jdText);
    const result = await geminiFlash.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text) as { skills: string[] };
    const rawSkills: string[] = parsed.skills ?? [];
    console.log("rawSkills", rawSkills);
    console.log("text", text);
    console.log("parsed", parsed);
    console.log("jdText", jdText);
    console.log("prompt", prompt);
    // Step 2: Return skills directly — skip vector search until MongoDB is configured
    const hasMongoUri = !!process.env.MONGODB_URI && !process.env.MONGODB_URI.includes("your_mongodb");

    const skillsWithMeta: ExtractedSkill[] = hasMongoUri
      ? await enrichWithVectorSearch(rawSkills)   // Only run if MongoDB is connected
      : rawSkills.map((name) => ({                 // Fallback: mark all as new
        name,
        normalizedName: name,
        similarity: 0,
        isNew: true,
      }));

    return NextResponse.json({ skills: skillsWithMeta });
  } catch (err) {
    console.error("[JD Extract]", err);
    const message = err instanceof Error ? err.message : "Failed to extract skills";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Only imported + called when MongoDB is available
async function enrichWithVectorSearch(rawSkills: string[]): Promise<ExtractedSkill[]> {
  const { generateEmbedding } = await import("@/lib/ai/embedding");
  const { searchSkillsByEmbedding } = await import("@/lib/ai/vectorSearch");

  return Promise.all(
    rawSkills.map(async (name) => {
      try {
        const embedding = await generateEmbedding(name);
        const matches = await searchSkillsByEmbedding(embedding, 1);
        const top = matches[0];
        const similarity = top?.score ?? 0;
        return { name, normalizedName: top?.normalizedName ?? name, similarity, isNew: similarity < 0.8 };
      } catch {
        return { name, normalizedName: name, similarity: 0, isNew: true };
      }
    })
  );
}
