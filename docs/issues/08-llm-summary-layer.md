## Parent PRD

#1

## What to build

Add the optional grounded LLM summary layer that runs after deterministic ranking and returns one concise top-level summary for the recommendation set. This slice should preserve the deterministic recommender as the source of truth and degrade gracefully when the LLM is unavailable.

## Acceptance criteria

- [ ] The backend can generate a single top-level summary using only grounded recommendation context from deterministic results
- [ ] The LLM layer cannot rerank recipes or invent unsupported recipe facts
- [ ] If the LLM call fails or no API key is configured, deterministic recommendations still render successfully

## Blocked by

- Blocked by #2
- Blocked by #4
- Blocked by #5

## User stories addressed

- User story 16
- User story 17
- User story 18
- User story 21
- User story 39

