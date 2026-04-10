import { ingredientSynonyms } from "./ingredient-synonyms";

const measurementWords = new Set([
  "g",
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
  "ounces",
  "clove",
  "cloves"
]);

const preparationWords = new Set([
  "chopped",
  "diced",
  "minced",
  "sliced",
  "crushed",
  "grated",
  "peeled",
  "shredded",
  "fresh",
  "large",
  "small",
  "medium",
  "ground"
]);

const optionalLeadingWords = new Set([
  "extra",
  "virgin",
  "boneless",
  "skinless"
]);

function singularizeWords(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map(singularize)
    .join(" ");
}

function canonicalizeIngredient(value: string): string {
  const exactMatch = ingredientSynonyms[value];

  if (exactMatch) {
    return exactMatch;
  }

  const parts = value.split(/\s+/).filter(Boolean);
  let firstMeaningfulIndex = 0;

  while (
    firstMeaningfulIndex < parts.length &&
    optionalLeadingWords.has(parts[firstMeaningfulIndex] ?? "")
  ) {
    firstMeaningfulIndex += 1;
  }

  const strippedLeadingWords = parts.slice(firstMeaningfulIndex).join(" ");

  return ingredientSynonyms[strippedLeadingWords] ?? strippedLeadingWords;
}

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
    .filter((part) => !preparationWords.has(part))
    .join(" ")
    .trim();
}

export function normalizeIngredient(value: string): string {
  const cleaned = stripNoise(value);
  const singular = singularizeWords(cleaned);
  const canonical = canonicalizeIngredient(singular);

  return singularizeWords(canonical).trim();
}

export function normalizeIngredients(values: string[]): string[] {
  return [...new Set(values.map(normalizeIngredient).filter(Boolean))];
}
