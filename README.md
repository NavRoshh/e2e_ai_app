# Recipe Recommender

This repository is scaffolded as an end-to-end AI application with five clear layers:

1. Raw data ingestion in `data/raw/`
2. Offline ETL and evaluation scripts in `scripts/`
3. Processed storage in `data/processed/recipes.cleaned.json`
4. Shared deterministic recommender logic in `src/lib/recommender/`
5. React UI and Vercel-friendly API routes in `src/app/`

## Build Order

1. Replace the sample raw dataset in `data/raw/` with your real source dataset.
2. Run `npm run etl` to generate `data/processed/recipes.cleaned.json` and the ETL reports.
3. Expand `eval/manual-queries.json` to 10 to 20 realistic test queries.
4. Tune normalization, ranking, thresholds, and fallback logic in `src/lib/recommender/`.
5. Add a real provider integration in `src/lib/llm/generate-summary.ts`.
6. Deploy to Vercel with `LLM_API_KEY` configured if you want live summaries.

## ETL Workflow

- Put a raw JSON dataset in `data/raw/`
- Run `npm run etl`
- Review:
  - `data/processed/recipes.cleaned.json`
  - `data/processed/etl-report.json`
  - `data/processed/etl-report.md`

The ETL script currently supports:
- a root JSON array of recipe records
- an object with a top-level `recipes` array
- ingredient fields such as `ingredients`, `ingredientLines`, and `recipeIngredient`
- title fields such as `title`, `name`, and `recipeName`

## Key Runtime Contract

- `POST /api/recommend`
- Request: `{ "ingredients": ["tomato", "onion", "pasta"] }`
- Response:
  - `hasStrongMatches`
  - `recipes[]` with `id`, `title`, `score`, `matchedIngredients`, `missingIngredients`, `reason`
  - `suggestedIngredientsToAdd[]`
  - `summary`

## Suggested Next Tasks

- Add evaluation output reporting
- Wire the LLM summary provider
- Add styling polish and loading/error UX refinement
