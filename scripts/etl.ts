import { promises as fs } from "node:fs";
import path from "node:path";
import { normalizeIngredients } from "../src/lib/recommender/normalize-ingredients";
import type { Recipe } from "../src/lib/recommender";

type RawRecipeRecord = Record<string, unknown>;

type EtlReport = {
  sourceFile: string;
  totalRawRecords: number;
  validRecipes: number;
  invalidRecords: number;
  duplicatesRemoved: number;
  outputRecords: number;
  generatedAt: string;
};

const rawDirectory = path.join(process.cwd(), "data", "raw");
const processedDirectory = path.join(process.cwd(), "data", "processed");
const processedRecipesPath = path.join(
  processedDirectory,
  "recipes.cleaned.json"
);
const processedReportPath = path.join(processedDirectory, "etl-report.json");
const processedSummaryPath = path.join(processedDirectory, "etl-report.md");

function getStringField(record: RawRecipeRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getNumberField(record: RawRecipeRecord, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

function toInstructionList(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const normalized = value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);

    return normalized.length > 0 ? normalized : undefined;
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\r?\n|[.](?=\s+[A-Z])/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return undefined;
}

function toIngredientList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object") {
          const objectValue = item as Record<string, unknown>;

          return (
            getStringField(objectValue, ["ingredient", "name", "text", "original"]) ??
            ""
          );
        }

        return "";
      })
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getFirstNonEmptyIngredientList(
  record: RawRecipeRecord,
  keys: string[]
): string[] {
  for (const key of keys) {
    const ingredients = toIngredientList(record[key]);

    if (ingredients.length > 0) {
      return ingredients;
    }
  }

  return [];
}

function normalizeRecipe(record: RawRecipeRecord, index: number): Recipe | null {
  const title = getStringField(record, ["title", "name", "recipeName"]);
  const rawIngredients = getFirstNonEmptyIngredientList(record, [
    "ingredients",
    "ingredientLines",
    "recipeIngredient"
  ]);

  const ingredients = normalizeIngredients(rawIngredients);

  if (!title || ingredients.length === 0) {
    return null;
  }

  const id =
    getStringField(record, ["id", "_id", "recipe_id"]) ??
    `generated-${index + 1}`;
  const cuisine = getStringField(record, ["cuisine", "category"]);
  const prepTime = getNumberField(record, [
    "prepTime",
    "prep_time",
    "cookTimeMinutes"
  ]);
  const instructions = toInstructionList(
    record.instructions ?? record.directions ?? record.steps
  );

  return {
    id,
    title,
    ingredients,
    ...(instructions ? { instructions } : {}),
    ...(cuisine ? { cuisine } : {}),
    ...(typeof prepTime === "number" ? { prepTime } : {})
  };
}

function dedupeKey(recipe: Recipe): string {
  return `${recipe.title.toLowerCase()}::${[...recipe.ingredients].sort().join("|")}`;
}

async function findSourceFile(): Promise<string> {
  const entries = await fs.readdir(rawDirectory, { withFileTypes: true });
  const jsonFile = entries.find(
    (entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".json")
  );

  if (!jsonFile) {
    throw new Error(
      "No raw JSON dataset found in data/raw/. Add a JSON file and run npm run etl."
    );
  }

  return path.join(rawDirectory, jsonFile.name);
}

async function readRawRecords(sourceFile: string): Promise<RawRecipeRecord[]> {
  const fileContents = await fs.readFile(sourceFile, "utf8");
  const parsed = JSON.parse(fileContents) as unknown;

  if (Array.isArray(parsed)) {
    return parsed.filter(
      (item): item is RawRecipeRecord => Boolean(item) && typeof item === "object"
    );
  }

  if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray((parsed as { recipes?: unknown[] }).recipes)
  ) {
    return (parsed as { recipes: unknown[] }).recipes.filter(
      (item): item is RawRecipeRecord => Boolean(item) && typeof item === "object"
    );
  }

  throw new Error(
    "Unsupported raw dataset format. Expected a JSON array or an object with a recipes array."
  );
}

function buildMarkdownReport(report: EtlReport): string {
  return `# ETL Report

- Source file: \`${report.sourceFile}\`
- Generated at: \`${report.generatedAt}\`
- Total raw records: ${report.totalRawRecords}
- Valid recipes before deduplication: ${report.validRecipes}
- Invalid records removed: ${report.invalidRecords}
- Duplicate records removed: ${report.duplicatesRemoved}
- Output records written: ${report.outputRecords}

The processed dataset guarantees:
- unique recipe ids at runtime
- non-empty recipe titles
- normalized ingredient arrays using base ingredient strings
- invalid and duplicate records removed before runtime
`;
}

async function main() {
  const sourceFile = await findSourceFile();
  const rawRecords = await readRawRecords(sourceFile);

  const normalizedRecipes = rawRecords
    .map((record, index) => normalizeRecipe(record, index))
    .filter((recipe): recipe is Recipe => recipe !== null);

  const dedupedRecipes = normalizedRecipes.filter((recipe, index, recipes) => {
    const currentKey = dedupeKey(recipe);

    return index === recipes.findIndex((candidate) => dedupeKey(candidate) === currentKey);
  });

  const report: EtlReport = {
    sourceFile: path.relative(process.cwd(), sourceFile),
    totalRawRecords: rawRecords.length,
    validRecipes: normalizedRecipes.length,
    invalidRecords: rawRecords.length - normalizedRecipes.length,
    duplicatesRemoved: normalizedRecipes.length - dedupedRecipes.length,
    outputRecords: dedupedRecipes.length,
    generatedAt: new Date().toISOString()
  };

  await fs.mkdir(processedDirectory, { recursive: true });
  await fs.writeFile(
    processedRecipesPath,
    `${JSON.stringify(dedupedRecipes, null, 2)}\n`,
    "utf8"
  );
  await fs.writeFile(
    processedReportPath,
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8"
  );
  await fs.writeFile(processedSummaryPath, buildMarkdownReport(report), "utf8");

  console.log(`ETL complete using ${report.sourceFile}`);
  console.log(`Raw records: ${report.totalRawRecords}`);
  console.log(`Valid records: ${report.validRecipes}`);
  console.log(`Invalid records removed: ${report.invalidRecords}`);
  console.log(`Duplicates removed: ${report.duplicatesRemoved}`);
  console.log(`Output records: ${report.outputRecords}`);
  console.log(`Wrote ${path.relative(process.cwd(), processedRecipesPath)}`);
  console.log(`Wrote ${path.relative(process.cwd(), processedReportPath)}`);
  console.log(`Wrote ${path.relative(process.cwd(), processedSummaryPath)}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown ETL error";
  console.error(`ETL failed: ${message}`);
  process.exitCode = 1;
});
