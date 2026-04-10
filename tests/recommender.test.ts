import test from "node:test";
import assert from "node:assert/strict";
import { recommendRecipes } from "../src/lib/recommender";
import { normalizeIngredients } from "../src/lib/recommender/normalize-ingredients";
import { rankRecipes } from "../src/lib/recommender/rank-recipes";
import { suggestIngredientsToAdd } from "../src/lib/recommender/suggest-ingredients-to-add";
import type { Recipe } from "../src/lib/recommender";

const fixtureRecipes: Recipe[] = [
  {
    id: "1",
    title: "Garlic Tomato Pasta",
    ingredients: ["pasta", "tomatoes", "garlic", "olive oil", "onions"]
  },
  {
    id: "2",
    title: "Egg Fried Rice",
    ingredients: ["rice", "egg", "soy sauce", "onion"]
  }
];

test("normalizeIngredients canonicalizes synonyms and plurals", () => {
  assert.deepEqual(normalizeIngredients(["Tomatoes", " onions ", "eggs"]), [
    "tomato",
    "onion",
    "egg"
  ]);
});

test("normalizeIngredients preserves meaningful multi-word ingredients while cleaning noise", () => {
  assert.deepEqual(
    normalizeIngredients([
      "Extra virgin olive oil",
      "boneless skinless chicken breasts",
      "spring onions",
      "garbanzo beans"
    ]),
    ["olive oil", "chicken breast", "green onion", "chickpea"]
  );
});

test("rankRecipes sorts stronger overlap first", () => {
  const ranked = rankRecipes(fixtureRecipes, ["tomato", "pasta", "onion"]);
  assert.equal(ranked[0]?.title, "Garlic Tomato Pasta");
  assert.equal(ranked[0]?.matchedIngredients.includes("tomato"), true);
});

test("rankRecipes benefits from canonical ingredient aliases", () => {
  const ranked = rankRecipes(
    [
      {
        id: "3",
        title: "Chickpea Pasta Salad",
        ingredients: ["chickpea", "pasta", "olive oil", "green onion"]
      },
      ...fixtureRecipes
    ],
    ["garbanzo beans", "spaghetti", "spring onions", "extra virgin olive oil"]
  );

  assert.equal(ranked[0]?.title, "Chickpea Pasta Salad");
  assert.deepEqual(ranked[0]?.matchedIngredients, [
    "chickpea",
    "pasta",
    "olive oil",
    "green onion"
  ]);
});

test("suggestIngredientsToAdd surfaces common missing items", () => {
  const ranked = rankRecipes(fixtureRecipes, ["egg"]);
  assert.deepEqual(suggestIngredientsToAdd(ranked, 2).length, 2);
});

test("recommendRecipes returns up to five strong matches when thresholds are met", () => {
  const result = recommendRecipes(
    [
      ...fixtureRecipes,
      {
        id: "3",
        title: "Tomato Egg Scramble",
        ingredients: ["egg", "tomato", "onion"]
      }
    ],
    ["egg", "tomato", "onion", "pasta", "garlic", "olive oil"]
  );

  assert.equal(result.hasStrongMatches, true);
  assert.equal(result.recipes.length, 2);
  assert.deepEqual(result.suggestedIngredientsToAdd, []);
});

test("recommendRecipes returns weaker candidates and ingredient suggestions when no strong match exists", () => {
  const result = recommendRecipes(fixtureRecipes, ["egg", "onion"]);

  assert.equal(result.hasStrongMatches, false);
  assert.equal(result.recipes.length > 0, true);
  assert.equal(result.recipes.length <= 3, true);
  assert.equal(result.suggestedIngredientsToAdd.includes("rice"), true);
});

test("recommendRecipes avoids returning zero-match filler results", () => {
  const result = recommendRecipes(fixtureRecipes, ["banana", "yogurt"]);

  assert.equal(result.hasStrongMatches, false);
  assert.deepEqual(result.recipes, []);
  assert.deepEqual(result.suggestedIngredientsToAdd, []);
});
