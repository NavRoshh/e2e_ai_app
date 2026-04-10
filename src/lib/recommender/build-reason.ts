import type { RecipeExplanation, ScoreResult } from "./types";

export function buildExplanation(result: ScoreResult): RecipeExplanation {
  const matchedCount = result.matchedIngredients.length;
  const missingCount = result.missingIngredients.length;
  const totalIngredients = matchedCount + missingCount;
  const coveragePercent =
    totalIngredients === 0
      ? 0
      : Math.round((matchedCount / totalIngredients) * 100);

  return {
    matchedCount,
    missingCount,
    totalIngredients,
    coveragePercent,
    matchStrength: result.isStrongMatch ? "strong" : "partial"
  };
}

export function buildReason(result: ScoreResult): string {
  const explanation = buildExplanation(result);

  if (explanation.missingCount === 0) {
    return `Matches all ${explanation.totalIngredients} ingredients.`;
  }

  if (explanation.missingCount === 1) {
    return `Matches ${explanation.matchedCount} of ${explanation.totalIngredients} ingredients and only misses ${result.missingIngredients[0]}.`;
  }

  return `Matches ${explanation.matchedCount} of ${explanation.totalIngredients} ingredients and misses ${explanation.missingCount} ingredients.`;
}
