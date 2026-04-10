# Processed Data

`recipes.cleaned.json` is the runtime dataset loaded by the recommendation API.

ETL also writes:
- `etl-report.json` for machine-readable transformation stats
- `etl-report.md` for a human-readable summary you can use in a demo or report

ETL guarantees:
- Unique `id`
- Non-empty `title`
- Normalized base-ingredient strings in `ingredients`
- Invalid and duplicate records removed before runtime
