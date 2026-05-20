# Experiment Results

Generated: 2026-05-20T09:01:53.708Z
Status: evaluated
Active source: fixture-experiment-results

## Recommendations

- hold-at-guardrail: first_session_pacing; fast-start is already at the maximum safe traffic weight.
- promote-winner: reward_offer; daily-streak beat score-booster on replayRate with 95% confidence.

## Experiments

### first_session_pacing

- Primary metric: tutorialCompletion
- Starts: 375
- Confidence: 94%
- Recommendation: hold-at-guardrail
- fast-start: score 0.505, tutorial 69%, completion 41%, replay 31%, abandonment 59%
- guided: score 0.419, tutorial 58%, completion 37%, replay 30%, abandonment 63%

### reward_offer

- Primary metric: replayRate
- Starts: 375
- Confidence: 95%
- Recommendation: promote-winner
- daily-streak: score 0.263, tutorial 67%, completion 39%, replay 35%, abandonment 61%
- score-booster: score 0.172, tutorial 62%, completion 41%, replay 23%, abandonment 59%
