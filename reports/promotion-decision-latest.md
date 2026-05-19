# Promotion Decision

Generated: 2026-05-19T02:57:53.936Z
Analytics source: fixture-sample
Release health: monitoring
Cost posture: no-new-spend

## Decisions

### web-pwa

- Status: promotable-internal
- Decision: Promote the current PWA build to an internal/public web experiment when hosting is connected.
- Next action: Connect a free static host or GitHub Pages environment, then publish dist.
- Blockers: none

### monetization

- Status: blocked
- Decision: Keep revenue features disabled.
- Next action: Collect live completion, replay, and retention data until gates pass.
- Blockers:
  - First-game completion is 40%; gate is 55%.
  - Replay rate is 31%; gate is 35%.
  - D1 retention is 17%; gate is 18%; source is fixture-retention.

### android-google-play

- Status: blocked
- Decision: Keep Android packaging blocked.
- Next action: Host privacy URL, create signing assets, and connect Google Play account.
- Blockers:
  - Hosted privacy policy URL is missing.
  - Google Play developer account is not connected.
  - Native package is blocked-draft-ready.

### ios-app-store

- Status: defer
- Decision: Defer iOS spend.
- Next action: Wait for revenue signal and hosted compliance URLs before paying annual Apple cost.
- Blockers:
  - Revenue signal is $0.00, below $99.00.
  - Apple Developer account is not connected.
  - Hosted privacy policy URL is missing.
