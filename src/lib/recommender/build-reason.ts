import type { ScoreResult } from "./types";

export function buildReason(result: ScoreResult): string {
  const matchedCount = result.matchedIngredients.length;
  const totalCount = matchedCount + result.missingIngredients.length;

  if (result.missingIngredients.length === 0) {
    return `Matches all ${totalCount} ingredients.`;
  }

  if (result.missingIngredients.length === 1) {
    return `Matches ${matchedCount} of ${totalCount} ingredients and only misses ${result.missingIngredients[0]}.`;
  }

  return `Matches ${matchedCount} of ${totalCount} ingredients and misses ${result.missingIngredients.length} ingredients.`;
}

