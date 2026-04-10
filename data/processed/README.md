# Processed Data

`recipes.cleaned.json` is the runtime dataset loaded by the recommendation API.

ETL guarantees:
- Unique `id`
- Non-empty `title`
- Normalized base-ingredient strings in `ingredients`
- Invalid and duplicate records removed before runtime

