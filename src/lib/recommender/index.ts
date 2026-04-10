import { rankRecipes } from "./rank-recipes";
import { MAX_MISSING_FOR_STRONG_MATCH, STRONG_MATCH_SCORE } from "./score-recipe";
import { suggestIngredientsToAdd } from "./suggest-ingredients-to-add";
import type { RankedRecipe, Recipe, RecommendationResponse } from "./types";

const MAX_STRONG_RESULTS = 5;
const MAX_WEAK_RESULTS = 3;

function isStrongMatch(recipe: RankedRecipe): boolean {
  return (
    recipe.score >= STRONG_MATCH_SCORE &&
    recipe.missingIngredients.length <= MAX_MISSING_FOR_STRONG_MATCH
  );
}

function isUsefulWeakMatch(recipe: RankedRecipe): boolean {
  return recipe.score > 0 && recipe.matchedIngredients.length > 0;
}

function splitResults(rankedRecipes: RankedRecipe[]): {
  strongMatches: RankedRecipe[];
  weakMatches: RankedRecipe[];
} {
  const strongMatches = rankedRecipes.filter(isStrongMatch);
  const weakMatches = rankedRecipes.filter(
    (recipe) => !isStrongMatch(recipe) && isUsefulWeakMatch(recipe)
  );

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
      recipes: strongMatches.slice(0, MAX_STRONG_RESULTS),
      suggestedIngredientsToAdd: [],
      summary: null
    };
  }

  const fallbackRecipes = weakMatches.slice(0, MAX_WEAK_RESULTS);

  return {
    hasStrongMatches: false,
    recipes: fallbackRecipes,
    suggestedIngredientsToAdd:
      fallbackRecipes.length > 0 ? suggestIngredientsToAdd(fallbackRecipes) : [],
    summary: null
  };
}

export type { Recipe, RecommendationResponse, RankedRecipe } from "./types";
