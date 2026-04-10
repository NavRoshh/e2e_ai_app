import { buildExplanation, buildReason } from "./build-reason";
import { scoreRecipe } from "./score-recipe";
import type { RankedRecipe, Recipe } from "./types";

function compareRank(a: RankedRecipe, b: RankedRecipe): number {
  if (b.score !== a.score) {
    return b.score - a.score;
  }

  return a.missingIngredients.length - b.missingIngredients.length;
}

export function rankRecipes(
  recipes: Recipe[],
  userIngredients: string[]
): RankedRecipe[] {
  return recipes
    .map((recipe) => {
      const scoreResult = scoreRecipe(recipe, userIngredients);
      const explanation = buildExplanation(scoreResult);

      return {
        id: recipe.id,
        title: recipe.title,
        score: scoreResult.score,
        matchedIngredients: scoreResult.matchedIngredients,
        missingIngredients: scoreResult.missingIngredients,
        reason: buildReason(scoreResult),
        explanation
      };
    })
    .sort(compareRank);
}
