# PRD: End-to-End AI Recipe Recommender

## Problem Statement

Busy home cooks often know what ingredients they already have, but they still struggle to quickly decide what practical meals they can make right now. Generic recipe sites require browsing, filtering, and guessing, which creates friction when the real need is simple: turn available ingredients into a few sensible recipe options immediately.

For this project, the goal is to build a course-friendly end-to-end AI application that clearly demonstrates the full pipeline from raw data ingestion to user-facing recommendations. The app should not depend on the LLM for core correctness. Instead, it should provide trustworthy, explainable recipe recommendations from a processed dataset and use the LLM only as a grounded enhancement layer.

## Solution

The product is a web application where a user enters available ingredients and receives a small set of practical recipe suggestions. The backend loads a cleaned recipe dataset, normalizes user input, ranks recipes deterministically using ingredient overlap, and returns structured recommendation data including scores, matched ingredients, missing ingredients, and deterministic reasons.

An optional LLM layer runs after ranking is complete. It uses only the already-computed recommendation results to generate a concise summary and conservative substitution guidance when appropriate. If the LLM is unavailable, the deterministic recommendation flow still succeeds.

The system is intentionally structured as an end-to-end AI pipeline with explicit stages:
- raw recipe data ingestion
- offline ETL and transformation
- processed data storage
- deterministic recommendation engine
- grounded LLM explanation layer
- React-based user interface with deployed API endpoints

## User Stories

1. As a busy home cook, I want to enter the ingredients I already have, so that I can quickly find recipes I can actually make.
2. As a busy home cook, I want to receive only a small number of recipe recommendations, so that I am not overwhelmed by choices.
3. As a busy home cook, I want recommendations to be based on my available ingredients, so that the results feel relevant and practical.
4. As a busy home cook, I want each recommendation to show how well it matches my ingredients, so that I can judge whether it is realistic to cook.
5. As a busy home cook, I want to see which ingredients matched and which are missing, so that I can decide whether the recipe is worth making.
6. As a busy home cook, I want a short reason for each recommendation, so that I can understand why it was chosen.
7. As a busy home cook, I want the app to work even if I only provide a few ingredients, so that I still get some helpful guidance.
8. As a busy home cook, I want the app to tell me when my input is too vague or too sparse, so that I know how to improve the results.
9. As a busy home cook, I want fallback suggestions for ingredients to add, so that I can unlock more recipe options.
10. As a busy home cook, I want the app to handle free-form ingredient text, so that I do not need to pick from a rigid predefined list.
11. As a busy home cook, I want the app to normalize small wording differences in ingredients, so that common variations still match recipes correctly.
12. As a busy home cook, I want meaningful multi-word ingredients to be preserved, so that the app does not collapse useful distinctions like `olive oil` versus `oil`.
13. As a busy home cook, I want strong matches to be clearly distinguished from weak ones, so that I can trust the ranking.
14. As a busy home cook, I want the app to show weaker candidates only when strong matches do not exist, so that low-confidence results are labeled honestly.
15. As a busy home cook, I want the recommendations to load in a single interaction, so that the experience feels fast and simple.
16. As a busy home cook, I want the app to remain useful even if the AI summary fails, so that the page still delivers value.
17. As a busy home cook, I want the AI-generated summary to stay grounded in the actual recommendation data, so that it does not invent recipe facts.
18. As a busy home cook, I want conservative substitution suggestions only when appropriate, so that the advice does not become unreliable.
19. As a student presenting the project, I want the architecture to clearly show ingestion, ETL, storage, reasoning, and UI layers, so that the app demonstrates a true end-to-end AI workflow.
20. As a student presenting the project, I want the deterministic recommender to be the core system behavior, so that I can explain and defend its correctness.
21. As a student presenting the project, I want the LLM to be clearly separated from ranking, so that I can show the difference between deterministic reasoning and AI-generated explanation.
22. As a student presenting the project, I want the dataset preprocessing pipeline to be reproducible, so that the project looks like a real system rather than a one-off demo.
23. As a student presenting the project, I want ETL outputs to be documented, so that I can show what changed between raw and processed data.
24. As a student presenting the project, I want a small evaluation set of representative ingredient queries, so that I can assess recommendation quality before polishing the UI.
25. As a student presenting the project, I want recommendation quality to be testable independent of the UI, so that I can iterate on the core logic safely.
26. As a developer, I want the recommendation logic isolated in a shared module, so that it can be reused by local development tooling and deployed API routes.
27. As a developer, I want ingredient normalization encapsulated behind a small interface, so that matching rules can evolve without rewriting the whole system.
28. As a developer, I want scoring and ranking logic isolated from API and UI concerns, so that behavior is easier to test.
29. As a developer, I want deterministic reasons built from templates rather than generated freely, so that explanations stay consistent and inspectable.
30. As a developer, I want synonym knowledge and substitution knowledge stored separately from scoring logic, so that domain mappings are explicit and maintainable.
31. As a developer, I want invalid and duplicate recipes removed before runtime, so that the application does not need to defend against dirty records everywhere.
32. As a developer, I want the backend API to return a stable response contract, so that the frontend can render results reliably.
33. As a developer, I want the processed dataset loaded as a simple runtime asset, so that the proof-of-concept stays operationally simple.
34. As a developer, I want local development to be straightforward, so that I can iterate quickly before deployment.
35. As a deployer, I want the application to run on Vercel with frontend and API routes together, so that the live demo matches the chosen hosting model.
36. As a deployer, I want environment variables to manage LLM credentials securely, so that the live app does not expose secrets.
37. As a reviewer, I want to see clear fallback behavior for no strong matches, so that the product appears robust rather than brittle.
38. As a reviewer, I want to see that the hosted app behaves consistently with the local implementation, so that the deployment feels credible.
39. As a reviewer, I want the app to demonstrate both algorithmic recommendation and AI-assisted explanation, so that it satisfies the spirit of an AI application without overclaiming what the LLM does.
40. As a future maintainer, I want the project structure to map cleanly to the pipeline stages, so that the codebase stays understandable as features grow.

## Implementation Decisions

- The project is framed as a course proof-of-concept that must still behave like a real end-to-end system.
- The core user flow is single-purpose: the user enters available ingredients and receives up to 5 practical recipe recommendations.
- User input for v1 is ingredients only. No dietary filters, cuisine filters, accounts, or personalization are included.
- The recommendation engine is deterministic and dataset-driven. The LLM is not allowed to rank recipes or override deterministic output.
- Ranking is based primarily on normalized ingredient overlap ratio, with a small bonus for direct matches and a penalty when too many ingredients are missing.
- A recipe is considered a strong match when its score meets the threshold and it does not exceed the missing-ingredient limit.
- Strong-match flows return up to 5 recipes. Weak-match flows return up to 3 recipes plus suggested ingredients to add.
- Suggestions for ingredients to add are derived deterministically from missing ingredients in near-matching recipes.
- Per-recipe reasons are generated from deterministic templates rather than free-form AI output.
- The LLM returns only one top-level summary in v1 to avoid duplication with per-recipe deterministic reasons.
- The LLM prompt is grounded only in user ingredients and computed recommendation fields such as titles, scores, matched ingredients, missing ingredients, reasons, and suggested additions.
- The LLM must not invent ingredients, instructions, cooking times, nutrition, or reranked outcomes.
- If the LLM fails, times out, or has no configured API key, the app still returns deterministic recommendations successfully.
- Ingredient inputs and dataset ingredients are both normalized to base ingredient names rather than raw measurement strings.
- Ingredient normalization preserves important multi-word ingredients and applies a small synonym mapping for common variants.
- Safe substitutions are limited to a small predefined mapping and are phrased conservatively when used.
- Raw data ingestion and ETL are offline developer workflows rather than user-facing features.
- ETL is responsible for filtering invalid recipes, enforcing schema, normalizing ingredient arrays, removing duplicates, and producing a processed dataset artifact.
- The processed dataset guarantees unique IDs, non-empty titles, and non-empty normalized ingredient lists before runtime.
- Storage for v1 is a processed JSON dataset loaded into backend memory at runtime rather than a database.
- The product architecture separates data ingestion, ETL, processed storage, recommendation logic, LLM summary generation, API delivery, and UI rendering.
- Shared recommendation logic is encapsulated into deep modules for normalization, scoring, ranking, deterministic reasons, fallback ingredient suggestions, and shared contracts.
- The deployed application target is Vercel, using frontend pages and serverless API routes together.
- Local development may use a lightweight server setup for convenience, but production architecture should align with Vercel’s serverless model.
- The API contract accepts a list of user ingredients and returns structured recommendation results with `hasStrongMatches`, recipe results, suggested additions, and optional summary text.
- The user interface is a single-page flow with ingredient input, submit action, validation state, loading state, result cards, fallback messaging, backend error handling, and optional summary display.
- Input validation blocks empty submissions and guides users toward providing at least 2 to 3 specific ingredients.
- The project structure should visibly reflect the pipeline stages so it is easy to explain in a report or demo.

## Testing Decisions

- Good tests should verify externally visible behavior and system contracts rather than implementation details.
- Tests should focus on whether normalized inputs lead to sensible ranked outputs, whether API responses conform to the agreed contract, and whether the UI handles required states correctly.
- The shared recommender modules should be tested directly because they contain the most important product logic and the highest project risk.
- Ingredient normalization should be tested with plural forms, synonyms, multi-word ingredients, and noisy inputs.
- Scoring and ranking should be tested with controlled fixtures that make expected ordering clear.
- Strong-match thresholds and weak-match fallbacks should be tested around boundary cases.
- Suggested-ingredient behavior should be tested to confirm that additions come from near matches rather than arbitrary generation.
- The API layer should be tested for valid requests, invalid input, strong matches, weak matches, and graceful behavior when the LLM summary is unavailable.
- The UI flow should be tested for idle, invalid input, loading, strong-match success, weak-match success, backend error, and summary-unavailable states.
- Manual evaluation should supplement automated tests with 10 to 20 realistic ingredient scenarios and expected acceptable result shapes.
- Prior art in this codebase is minimal because the repository is newly scaffolded, so testing conventions will need to be established by this feature.

## Out of Scope

- User accounts
- Personalization
- Full conversational chat
- User-uploaded recipe datasets
- Vector search or vector databases
- LLM-controlled ranking
- Nutrition analysis
- Budget optimization
- Shopping cart or grocery ordering integrations
- Complex meal planning or multi-day scheduling
- Rich recipe authoring tools
- Advanced typo correction beyond lightweight normalization
- Large-scale production data infrastructure

## Further Notes

- The biggest project risk is data quality and ingredient normalization. Recommendation quality will depend more on clean inputs and useful canonicalization than on the LLM layer.
- The recommended implementation order is: acquire dataset, implement ETL, build evaluation cases, validate deterministic ranking, expose the API, build the UI, and add the LLM summary last.
- The project should be presented as a hybrid system: deterministic retrieval and ranking for correctness, plus a constrained LLM for user-friendly explanation.
- The live acceptance checks for the deployed app are:
  1. Valid ingredient queries return up to 5 ranked recipes with scores, matched ingredients, missing ingredients, and deterministic reasons.
  2. Weak queries return `hasStrongMatches: false`, up to 3 weaker candidates, and suggested ingredients to add.
  3. Empty or vague input is blocked or guided with clear validation.
  4. If the LLM call fails, deterministic recommendations still appear without breaking the page.
  5. The hosted application responds end-to-end using the processed dataset consistently.

