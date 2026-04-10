import { rankRecipes } from "./rank-recipes";
import { STRONG_MATCH_SCORE } from "./score-recipe";
import { suggestIngredientsToAdd } from "./suggest-ingredients-to-add";
import type { RankedRecipe, Recipe, RecommendationResponse } from "./types";

function splitResults(rankedRecipes: RankedRecipe[]): {
  strongMatches: RankedRecipe[];
  weakMatches: RankedRecipe[];
} {
  const strongMatches = rankedRecipes.filter(
    (recipe) => recipe.score >= STRONG_MATCH_SCORE && recipe.missingIngredients.length <= 3
  );
  const weakMatches = rankedRecipes.filter((recipe) => !strongMatches.includes(recipe));

  return { strongMatches, weakMatches };
}

export function recommendRecipes(
  recipes: Recipe[],
  userIngredients: string[]
): RecommendationResponse {
  const rankedRecipes = rankRecipes(recipes, userIngredients);
  const { strongMatches, weakMatches } = splitResults(rankedRecipes);

  if (strongMatches.length > 0) {
    return {
      hasStrongMatches: true,
      recipes: strongMatches.slice(0, 5),
      suggestedIngredientsToAdd: [],
      summary: null
    };
  }

  const fallbackRecipes = weakMatches.slice(0, 3);

  return {
    hasStrongMatches: false,
    recipes: fallbackRecipes,
    suggestedIngredientsToAdd: suggestIngredientsToAdd(fallbackRecipes),
    summary: null
  };
}

export type { Recipe, RecommendationResponse, RankedRecipe } from "./types";

