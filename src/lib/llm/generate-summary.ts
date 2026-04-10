import OpenAI from "openai";
import type { RecommendationResponse } from "@/lib/recommender";

const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
});

export async function generateSummary(
  userIngredients: string[],
  result: RecommendationResponse
): Promise<string | null> {
  console.log("KEY LOADED:", !!process.env.LLM_API_KEY);
  console.log("LLM CALLED");

  if (!process.env.LLM_API_KEY || result.recipes.length === 0) {
    return null;
  }

  try {
    const prompt = `
User ingredients: ${userIngredients.join(", ")}

Top recipe recommendations:
${result.recipes.map(r => `
- ${r.title}
  Score: ${r.score}
  Matched: ${r.matchedIngredients.join(", ")}
  Missing: ${r.missingIngredients.join(", ")}
`).join("\n")}

Write a short (2-3 lines) helpful summary suggesting what the user can cook.
`;

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content ?? null;
  } catch (error) {
    console.error("LLM failed:", error);
    return null;
    
  }
}