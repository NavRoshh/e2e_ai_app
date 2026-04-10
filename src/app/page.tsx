"use client";

import { FormEvent, useState } from "react";
import type { RecommendationResponse } from "@/lib/recommender";

const initialState: RecommendationResponse | null = null;

function parseIngredients(rawValue: string): string[] {
  return [...new Set(rawValue.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean))];
}

function getBannerCopy(result: RecommendationResponse): string {
  if (result.summary) {
    return result.summary;
  }

  if (result.hasStrongMatches) {
    return "These are the strongest deterministic matches from the processed dataset.";
  }

  if (result.recipes.length > 0) {
    return "These are lower-confidence ideas based on partial overlap. Adding one or two missing ingredients should improve the match quality.";
  }

  return "No close matches were found yet. Try adding 2 to 3 more specific ingredients to unlock better recommendations.";
}

export default function HomePage() {
  const [ingredients, setIngredients] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResponse | null>(initialState);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedIngredients = parseIngredients(ingredients);

    if (parsedIngredients.length === 0) {
      setError("Add at least 2 to 3 specific ingredients to get useful recommendations.");
      setResult(null);
      return;
    }

    if (parsedIngredients.length < 2) {
      setError("Use at least 2 specific ingredients for stronger matches.");
      setResult(null);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ingredients: parsedIngredients })
      });

      if (!response.ok) {
        throw new Error("Recommendation request failed.");
      }

      const data = (await response.json()) as RecommendationResponse;
      setResult(data);
    } catch {
      setError("The recommender is unavailable right now. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "48px 20px 72px"
      }}
    >
      <section
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: "28px",
          padding: "32px",
          boxShadow: "var(--shadow)"
        }}
      >
        <p style={{ color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
          End-to-End AI App
        </p>
        <h1 style={{ fontSize: "clamp(2.4rem, 6vw, 4.8rem)", margin: "0 0 12px" }}>
          Recipe recommendations from what you already have.
        </h1>
        <p style={{ maxWidth: 700, color: "var(--muted)", fontSize: "1.1rem", lineHeight: 1.6 }}>
          Enter the ingredients in your kitchen. The backend ranks recipes deterministically from the processed JSON dataset, then optionally adds a grounded LLM summary.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: 28, display: "grid", gap: 16 }}>
          <label htmlFor="ingredients" style={{ fontWeight: 700 }}>
            Ingredients
          </label>
          <textarea
            id="ingredients"
            rows={5}
            value={ingredients}
            onChange={(event) => setIngredients(event.target.value)}
            placeholder="tomato, onion, pasta"
            style={{
              borderRadius: "18px",
              border: "1px solid var(--border)",
              padding: "18px 20px",
              background: "#fffdf8",
              resize: "vertical"
            }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <button
              disabled={loading}
              type="submit"
              style={{
                border: 0,
                borderRadius: "999px",
                background: "var(--accent)",
                color: "white",
                padding: "14px 22px",
                cursor: "pointer"
              }}
            >
              {loading ? "Finding recipes..." : "Recommend recipes"}
            </button>
            <span style={{ color: "var(--muted)" }}>
              Separate items with commas. Duplicates and empty values are ignored.
            </span>
          </div>
        </form>

        {error ? (
          <p style={{ color: "#a61c1c", marginTop: 18 }}>{error}</p>
        ) : null}
      </section>

      {result ? (
        <section style={{ marginTop: 28, display: "grid", gap: 20 }}>
          <div
            style={{
              background: result.hasStrongMatches ? "#eef7ef" : "#fff5e8",
              borderRadius: "22px",
              padding: "18px 20px",
              border: `1px solid ${result.hasStrongMatches ? "#cbe2cf" : "#efd3af"}`
            }}
          >
            <strong>
              {result.hasStrongMatches
                ? "Strong matches found"
                : result.recipes.length > 0
                  ? "No strong matches yet"
                  : "No close matches found"}
            </strong>
            <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>
              {getBannerCopy(result)}
            </p>
            {!result.hasStrongMatches && result.suggestedIngredientsToAdd.length > 0 ? (
              <p style={{ margin: "10px 0 0" }}>
                Try adding: {result.suggestedIngredientsToAdd.join(", ")}.
              </p>
            ) : null}
          </div>

          {result.recipes.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 18
              }}
            >
              {result.recipes.map((recipe) => (
                <article
                  key={recipe.id}
                  style={{
                    background: "var(--panel)",
                    border: "1px solid var(--border)",
                    borderRadius: "24px",
                    padding: "20px",
                    boxShadow: "var(--shadow)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <h2 style={{ marginTop: 0, marginBottom: 12 }}>{recipe.title}</h2>
                    <span
                      style={{
                        background: result.hasStrongMatches ? "#d9ecdc" : "#f6dfc1",
                        color: result.hasStrongMatches ? "var(--success)" : "var(--warning)",
                        borderRadius: "999px",
                        padding: "6px 10px",
                        fontSize: "0.85rem",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {result.hasStrongMatches ? "Strong match" : "Partial match"}
                    </span>
                  </div>
                  <p style={{ marginBottom: 10 }}>
                    <strong>Score:</strong> {recipe.score}
                  </p>
                  <p style={{ margin: "0 0 10px" }}>{recipe.reason}</p>
                  <p style={{ margin: "0 0 10px" }}>
                    <strong>Matched:</strong> {recipe.matchedIngredients.join(", ") || "None"}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Missing:</strong> {recipe.missingIngredients.join(", ") || "None"}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div
              style={{
                background: "var(--panel)",
                border: "1px dashed var(--border)",
                borderRadius: "24px",
                padding: "22px 20px"
              }}
            >
              Add a few more ingredients like a protein, a base, or an aromatic to unlock better recipe matches.
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}
