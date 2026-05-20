export const experimentPolicy = {
  "generatedAt": "2026-05-20T12:33:37.549Z",
  "guardrails": {
    "minVariantWeight": 15,
    "maxVariantWeight": 85,
    "maxShiftPerRun": 10,
    "minimumConfidence": 70,
    "minimumConfidenceByExperiment": {
      "first_session_pacing": 75,
      "reward_offer": 55,
      "thumbnail_board_state_v2": 70
    }
  },
  "experiments": {
    "first_session_pacing": {
      "goal": "Improve first-session tutorial completion without hiding core rules.",
      "variants": [
        {
          "id": "fast-start",
          "label": "Start playing after one sentence",
          "weight": 85
        },
        {
          "id": "guided",
          "label": "Show one extra example before play",
          "weight": 15
        }
      ]
    },
    "reward_offer": {
      "goal": "Improve replay intent with low-pressure post-game reward framing.",
      "variants": [
        {
          "id": "daily-streak",
          "label": "Reward daily streak progress",
          "weight": 80
        },
        {
          "id": "score-booster",
          "label": "Reward score target progress",
          "weight": 20
        }
      ]
    },
    "thumbnail_board_state_v2": {
      "goal": "Improve game-view-to-start conversion with clearer board-state thumbnails.",
      "variants": [
        {
          "id": "board-state",
          "label": "Show a stronger board-state preview",
          "weight": 60
        },
        {
          "id": "title-first",
          "label": "Keep the title-led card treatment",
          "weight": 40
        }
      ]
    }
  }
} as const

export type ExperimentPolicy = typeof experimentPolicy
