const vagueIngredients = new Set([
  "food",
  "meal",
  "dish",
  "sauce",
  "spice",
  "seasoning",
  "ingredient"
]);

export function validateIngredients(ingredients: string[]): string | null {
  if (ingredients.length === 0) {
    return "Add at least 2 to 3 specific ingredients to get useful recommendations.";
  }

  if (ingredients.length < 2) {
    return "Use at least 2 specific ingredients for stronger matches.";
  }

  const specificIngredients = ingredients.filter(
    (ingredient) => !vagueIngredients.has(ingredient)
  );

  if (specificIngredients.length < 2) {
    return "Try 2 to 3 more specific ingredients like tomato, onion, rice, or chicken.";
  }

  return null;
}

