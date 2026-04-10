import type { RecommendationResponse } from "@/lib/recommender";

/**
 * Optional enhancement layer.
 *
 * Wire your provider here after the deterministic recommender is validated.
 * The app should continue working when this function returns null.
 */
export async function generateSummary(
  userIngredients: string[],
  result: RecommendationResponse
): Promise<string | null> {
  const apiKey = process.env.LLM_API_KEY;

  if (!apiKey || result.recipes.length === 0) {
    return null;
  }

  void userIngredients;
  return "LLM summary integration goes here once a provider is configured.";
}

