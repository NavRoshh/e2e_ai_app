# Recipe Recommender

This repository is scaffolded as an end-to-end AI application with five clear layers:

1. Raw data ingestion in `data/raw/`
2. Offline ETL and evaluation scripts in `scripts/`
3. Processed storage in `data/processed/recipes.cleaned.json`
4. Shared deterministic recommender logic in `src/lib/recommender/`
5. React UI and Vercel-friendly API routes in `src/app/`

## Build Order

1. Replace the sample processed dataset with your real cleaned dataset.
2. Implement `scripts/etl.ts` to generate `data/processed/recipes.cleaned.json`.
3. Expand `eval/manual-queries.json` to 10 to 20 realistic test queries.
4. Tune normalization, ranking, thresholds, and fallback logic in `src/lib/recommender/`.
5. Add a real provider integration in `src/lib/llm/generate-summary.ts`.
6. Deploy to Vercel with `LLM_API_KEY` configured if you want live summaries.

## Key Runtime Contract

- `POST /api/recommend`
- Request: `{ "ingredients": ["tomato", "onion", "pasta"] }`
- Response:
  - `hasStrongMatches`
  - `recipes[]` with `id`, `title`, `score`, `matchedIngredients`, `missingIngredients`, `reason`
  - `suggestedIngredientsToAdd[]`
  - `summary`

## Suggested Next Tasks

- Implement ETL for your chosen dataset
- Add stronger ingredient normalization rules
- Add evaluation output reporting
- Wire the LLM summary provider
- Add styling polish and loading/error UX refinement
