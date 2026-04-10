# Evaluation Report

- Total scenarios: 10
- Passed: 10
- Failed: 0

| Scenario | Status | Top result | Strong match | Notes |
| --- | --- | --- | --- | --- |
| Pasta pantry overlap | PASS | Garlic Tomato Pasta | Yes | A tomato-based pasta recipe should rank at the top. |
| Fried rice pantry overlap | PASS | Chicken Fried Rice | Yes | A fried-rice style recipe should surface clearly. |
| Breakfast vegetable overlap | PASS | Simple Veggie Omelette | Yes | Vegetable omelette should be the best fit. |
| Salad pantry overlap | PASS | Chickpea Salad Bowl | Yes | Normalization should map plurals to the salad recipe. |
| Alias-heavy pantry overlap | PASS | Chickpea Salad Bowl | No | Alias handling should still surface the salad as a near match. |
| Partial egg overlap | PASS | Simple Veggie Omelette | No | No strong match should exist, but a useful partial recipe should still be returned. |
| Very weak pantry input | PASS | None | No | No filler recipes should be returned. |
| Tomato and aromatics overlap | PASS | Garlic Tomato Pasta | Yes | The pasta dish currently clears the strong-match threshold with this overlap. |
| Chicken rice overlap | PASS | Chicken Fried Rice | Yes | Chicken fried rice should remain a strong match. |
| Vague invalid input | PASS | None | No | This should be rejected by validation rather than evaluated like a real query. |
