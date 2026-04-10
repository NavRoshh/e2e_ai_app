import { normalizeIngredients } from "./normalize-ingredients";
import type { Recipe, ScoreResult } from "./types";

export const STRONG_MATCH_SCORE = 0.6;
export const MAX_MISSING_FOR_STRONG_MATCH = 3;

export function scoreRecipe(
  recipe: Recipe,
  userIngredients: string[]
): ScoreResult {
  const normalizedUserIngredients = new Set(normalizeIngredients(userIngredients));
  const normalizedRecipeIngredients = normalizeIngredients(recipe.ingredients);

  const matchedIngredients = normalizedRecipeIngredients.filter((ingredient) =>
    normalizedUserIngredients.has(ingredient)
  );

  const missingIngredients = normalizedRecipeIngredients.filter(
    (ingredient) => !normalizedUserIngredients.has(ingredient)
  );

  const baseScore =
    normalizedRecipeIngredients.length === 0
      ? 0
      : matchedIngredients.length / normalizedRecipeIngredients.length;

  const exactMatchBonus = matchedIngredients.length > 0 ? 0.05 : 0;
  const missingPenalty =
    missingIngredients.length > MAX_MISSING_FOR_STRONG_MATCH ? 0.05 : 0;
  const score = Math.max(
    0,
    Math.min(1, Number((baseScore + exactMatchBonus - missingPenalty).toFixed(2)))
  );

  return {
    score,
    matchedIngredients,
    missingIngredients,
    isStrongMatch:
      score >= STRONG_MATCH_SCORE &&
      missingIngredients.length <= MAX_MISSING_FOR_STRONG_MATCH
  };
}

