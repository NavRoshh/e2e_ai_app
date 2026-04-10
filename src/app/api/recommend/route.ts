import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { generateSummary } from "@/lib/llm/generate-summary";
import { recommendRecipes, type Recipe } from "@/lib/recommender";
import { validateIngredients } from "@/lib/recommender/validate-ingredients";

type RecommendRequest = {
  ingredients?: unknown;
};

async function loadRecipes(): Promise<Recipe[]> {
  const filePath = path.join(process.cwd(), "data", "processed", "recipes.cleaned.json");
  const fileContents = await fs.readFile(filePath, "utf-8");

  return JSON.parse(fileContents) as Recipe[];
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as RecommendRequest;

  if (!Array.isArray(body.ingredients)) {
    return NextResponse.json(
      { message: "ingredients must be an array of strings" },
      { status: 400 }
    );
  }

  const userIngredients = body.ingredients
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const validationMessage = validateIngredients(userIngredients);

  if (validationMessage) {
    return NextResponse.json(
      { message: validationMessage },
      { status: 400 }
    );
  }

  const recipes = await loadRecipes();
  const result = recommendRecipes(recipes, userIngredients);
  const summary = await generateSummary(userIngredients, result);

  return NextResponse.json({
    ...result,
    summary
  });
}
