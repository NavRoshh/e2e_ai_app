# ETL Report

- Source file: `data\raw\recipes.raw.sample.json`
- Generated at: `2026-04-10T01:17:35.478Z`
- Total raw records: 7
- Valid recipes before deduplication: 5
- Invalid records removed: 2
- Duplicate records removed: 1
- Output records written: 4

The processed dataset guarantees:
- unique recipe ids at runtime
- non-empty recipe titles
- normalized ingredient arrays using base ingredient strings
- invalid and duplicate records removed before runtime
