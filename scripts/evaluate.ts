import { promises as fs } from "node:fs";
import path from "node:path";
import { recommendRecipes, type Recipe } from "../src/lib/recommender";
import { validateIngredients } from "../src/lib/recommender/validate-ingredients";

type EvaluationCase = {
  name: string;
  ingredients: string[];
  expectedTopTitle: string | null;
  expectStrongMatch: boolean;
  expectAtLeastRecipes: number;
  expectedSuggestedIngredients: string[];
  notes: string;
};

type EvaluationResult = {
  name: string;
  passed: boolean;
  ingredients: string[];
  validationMessage: string | null;
  expectedTopTitle: string | null;
  actualTopTitle: string | null;
  expectedStrongMatch: boolean;
  actualStrongMatch: boolean;
  expectedMinimumRecipes: number;
  actualRecipeCount: number;
  expectedSuggestedIngredients: string[];
  actualSuggestedIngredients: string[];
  notes: string;
};

const processedRecipesPath = path.join(
  process.cwd(),
  "data",
  "processed",
  "recipes.cleaned.json"
);
const manualQueriesPath = path.join(process.cwd(), "eval", "manual-queries.json");
const evaluationOutputPath = path.join(
  process.cwd(),
  "eval",
  "evaluation-report.json"
);
const evaluationMarkdownPath = path.join(
  process.cwd(),
  "eval",
  "evaluation-report.md"
);

async function readJsonFile<T>(filePath: string): Promise<T> {
  const fileContents = await fs.readFile(filePath, "utf8");
  return JSON.parse(fileContents) as T;
}

function includesExpectedSuggestions(actual: string[], expected: string[]): boolean {
  return expected.every((ingredient) => actual.includes(ingredient));
}

function evaluateCase(
  testCase: EvaluationCase,
  recipes: Recipe[]
): EvaluationResult {
  const validationMessage = validateIngredients(testCase.ingredients);

  if (validationMessage) {
    const passed =
      testCase.expectAtLeastRecipes === 0 && testCase.expectedTopTitle === null;

    return {
      name: testCase.name,
      passed,
      ingredients: testCase.ingredients,
      validationMessage,
      expectedTopTitle: testCase.expectedTopTitle,
      actualTopTitle: null,
      expectedStrongMatch: testCase.expectStrongMatch,
      actualStrongMatch: false,
      expectedMinimumRecipes: testCase.expectAtLeastRecipes,
      actualRecipeCount: 0,
      expectedSuggestedIngredients: testCase.expectedSuggestedIngredients,
      actualSuggestedIngredients: [],
      notes: testCase.notes
    };
  }

  const recommendation = recommendRecipes(recipes, testCase.ingredients);
  const actualTopTitle = recommendation.recipes[0]?.title ?? null;
  const passed =
    recommendation.hasStrongMatches === testCase.expectStrongMatch &&
    recommendation.recipes.length >= testCase.expectAtLeastRecipes &&
    (testCase.expectedTopTitle === null || actualTopTitle === testCase.expectedTopTitle) &&
    includesExpectedSuggestions(
      recommendation.suggestedIngredientsToAdd,
      testCase.expectedSuggestedIngredients
    );

  return {
    name: testCase.name,
    passed,
    ingredients: testCase.ingredients,
    validationMessage: null,
    expectedTopTitle: testCase.expectedTopTitle,
    actualTopTitle,
    expectedStrongMatch: testCase.expectStrongMatch,
    actualStrongMatch: recommendation.hasStrongMatches,
    expectedMinimumRecipes: testCase.expectAtLeastRecipes,
    actualRecipeCount: recommendation.recipes.length,
    expectedSuggestedIngredients: testCase.expectedSuggestedIngredients,
    actualSuggestedIngredients: recommendation.suggestedIngredientsToAdd,
    notes: testCase.notes
  };
}

function buildMarkdownReport(results: EvaluationResult[]): string {
  const passedCount = results.filter((result) => result.passed).length;
  const failedCount = results.length - passedCount;

  const lines = [
    "# Evaluation Report",
    "",
    `- Total scenarios: ${results.length}`,
    `- Passed: ${passedCount}`,
    `- Failed: ${failedCount}`,
    "",
    "| Scenario | Status | Top result | Strong match | Notes |",
    "| --- | --- | --- | --- | --- |"
  ];

  for (const result of results) {
    lines.push(
      `| ${result.name} | ${result.passed ? "PASS" : "FAIL"} | ${
        result.actualTopTitle ?? "None"
      } | ${result.actualStrongMatch ? "Yes" : "No"} | ${result.notes} |`
    );
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
  const recipes = await readJsonFile<Recipe[]>(processedRecipesPath);
  const manualQueries = await readJsonFile<EvaluationCase[]>(manualQueriesPath);
  const results = manualQueries.map((testCase) => evaluateCase(testCase, recipes));
  const passedCount = results.filter((result) => result.passed).length;

  await fs.writeFile(
    evaluationOutputPath,
    `${JSON.stringify(results, null, 2)}\n`,
    "utf8"
  );
  await fs.writeFile(
    evaluationMarkdownPath,
    buildMarkdownReport(results),
    "utf8"
  );

  console.log(`Evaluated ${results.length} scenarios against ${recipes.length} recipes.`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${results.length - passedCount}`);
  console.log(`Wrote ${path.relative(process.cwd(), evaluationOutputPath)}`);
  console.log(`Wrote ${path.relative(process.cwd(), evaluationMarkdownPath)}`);

  for (const result of results) {
    console.log(
      `[${result.passed ? "PASS" : "FAIL"}] ${result.name} -> ${
        result.actualTopTitle ?? result.validationMessage ?? "No result"
      }`
    );
  }

  if (passedCount !== results.length) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Unknown evaluation error";
  console.error(`Evaluation failed: ${message}`);
  process.exitCode = 1;
});
