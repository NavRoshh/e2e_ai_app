## Parent PRD

#1

## What to build

Add the confidence model for recommendation results by distinguishing strong matches from weaker ones and surfacing helpful fallback behavior. This slice should implement strong-match thresholds, weak-match labeling, weaker candidate results, and suggested ingredients to add when strong matches are unavailable.

## Acceptance criteria

- [ ] The API distinguishes strong-match and weak-match outcomes using the agreed threshold and missing-ingredient rules
- [ ] Weak-match flows return up to three weaker candidates plus suggested ingredients to add
- [ ] The UI clearly communicates when no strong matches are available instead of presenting weak results as equally confident

## Blocked by

- Blocked by #2
- Blocked by #3

## User stories addressed

- User story 7
- User story 8
- User story 9
- User story 13
- User story 14
- User story 37

