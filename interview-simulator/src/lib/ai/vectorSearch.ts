import connectDB from "@/lib/db/mongodb";
import Skill from "@/lib/db/models/Skill";
import Question from "@/lib/db/models/Question";

export interface VectorSearchResult {
  _id: string;
  name: string;
  normalizedName: string;
  score: number;
}

/**
 * Search the Skill collection using MongoDB Atlas Vector Search.
 * Index name: "skill_vector_index" (configure this in Atlas UI on the `embedding` field).
 */
export async function searchSkillsByEmbedding(
  embedding: number[],
  limit = 5
): Promise<VectorSearchResult[]> {
  await connectDB();

  const pipeline = [
    {
      $vectorSearch: {
        index: "skill_vector_index",
        path: "embedding",
        queryVector: embedding,
        numCandidates: limit * 10,
        limit,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        normalizedName: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Skill.aggregate(pipeline as any[]);
}

/**
 * Retrieve top-k questions for a given skill by vector similarity.
 * Index name: "question_vector_index" (configure in Atlas UI on the `embedding` field).
 */
export async function searchQuestionsByEmbedding(
  skillId: string,
  topicEmbedding: number[],
  k = 5
): Promise<Array<{ _id: string; question: string; goldAnswer: string; skillName: string }>> {
  await connectDB();

  const pipeline = [
    {
      $vectorSearch: {
        index: "question_vector_index",
        path: "embedding",
        queryVector: topicEmbedding,
        numCandidates: k * 10,
        limit: k,
        filter: { skillId: { $eq: skillId } },
      },
    },
    {
      $project: {
        _id: 1,
        question: 1,
        goldAnswer: 1,
        skillName: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Question.aggregate(pipeline as any[]);
}
