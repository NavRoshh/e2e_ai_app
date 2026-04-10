export type Recipe = {
  id: string;
  title: string;
  ingredients: string[];
  instructions?: string[];
  cuisine?: string;
  prepTime?: number;
};

export type RankedRecipe = {
  id: string;
  title: string;
  score: number;
  matchedIngredients: string[];
  missingIngredients: string[];
  reason: string;
};

export type RecommendationResponse = {
  hasStrongMatches: boolean;
  recipes: RankedRecipe[];
  suggestedIngredientsToAdd: string[];
  summary: string | null;
};

export type ScoreResult = {
  score: number;
  matchedIngredients: string[];
  missingIngredients: string[];
  isStrongMatch: boolean;
};

