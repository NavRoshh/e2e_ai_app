import { ingredientSynonyms } from "./ingredient-synonyms";

const measurementWords = new Set([
  "cup",
  "cups",
  "tbsp",
  "tsp",
  "teaspoon",
  "teaspoons",
  "tablespoon",
  "tablespoons",
  "gram",
  "grams",
  "kg",
  "ml",
  "liter",
  "liters",
  "oz",
  "ounce",
  "ounces"
]);

function singularize(value: string): string {
  if (value.endsWith("ies")) {
    return `${value.slice(0, -3)}y`;
  }

  if (value.endsWith("oes")) {
    return value.slice(0, -2);
  }

  if (value.endsWith("s") && !value.endsWith("ss")) {
    return value.slice(0, -1);
  }

  return value;
}

function stripNoise(value: string): string {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[0-9/.-]+/g, " ")
    .replace(/[,]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((part) => !measurementWords.has(part))
    .join(" ")
    .trim();
}

export function normalizeIngredient(value: string): string {
  const cleaned = stripNoise(value);
  const canonical = ingredientSynonyms[cleaned] ?? cleaned;

  return singularize(canonical).trim();
}

export function normalizeIngredients(values: string[]): string[] {
  return [...new Set(values.map(normalizeIngredient).filter(Boolean))];
}

