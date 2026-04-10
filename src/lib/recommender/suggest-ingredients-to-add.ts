import type { RankedRecipe } from "./types";

export function suggestIngredientsToAdd(
  rankedRecipes: RankedRecipe[],
  limit = 3
): string[] {
  const counts = new Map<string, number>();

  for (const recipe of rankedRecipes) {
    for (const ingredient of recipe.missingIngredients) {
      counts.set(ingredient, (counts.get(ingredient) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([ingredient]) => ingredient);
}

