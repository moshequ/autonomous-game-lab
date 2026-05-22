# Production Measurement Status

Generated: 2026-05-22T15:18:49.960Z
Status: production-measurement-local-intake-ready
Active path: local-browser-buffer
Live candidate: pwa-e41ffb89580c
Source hash: f8a0f31696dc

## Analytics

- rollup source: fixture-sample
- browser forwarding configured: false
- autonomous rollups configured: false
- local evidence ready: true
- public aggregate handoff: awaiting-player-initiated-aggregate-notes
- analytics unlock: owner-input-required
- analytics unlock path: first-party-collector
- aggregate evidence notes: 0
- supporting aggregate mission notes: 0

## Public Routes

- statusPage: /measurement-status.html
- statusJson: /measurement-status.json
- gateSample: /gate-sample.html
- support: /support.html
- privacy: /privacy.html
- analyticsEvidenceIssue: https://github.com/moshequ/autonomous-game-lab/issues/new?template=analytics-evidence.yml&title=%5BEvidence%5D+Player+event+export+note&body=Thanks+for+helping+improve+Autonomous+Game+Lab.%0A%0AGitHub+Issues+are+public.+Share+aggregate+counts+only.%0ADo+not+paste+private+information%2C+raw+analytics+exports%2C+event+rows%2C+private+identifiers%2C+or+uploaded+event+files+into+this+issue.%0A%0ASupport+type%3A+analytics-evidence%0AGame+or+mission%3A%0AEvidence+window%3A%0AAggregate+starts%3A%0AAggregate+completions%3A%0AAggregate+replays%3A%0AAggregate+D1+eligible+players%3A%0AAggregate+D1+retained+players%3A%0AWhat+changed+or+looked+unusual%3A

## Controls

- publicArtifact: true
- zeroPaidSpend: true
- noSecretValues: true
- noRawAnalyticsRows: true
- aggregateOnlyEvidence: true
- playerInitiatedExportsOnly: true
- aggregateEvidenceDoesNotPassGates: true
- manualReviewRequiredForGateDecisions: true
- noAutomaticPublicUpload: true
- noStoreSubmission: true
- noRevenueEnablement: true

## Next Actions

- Use the player-initiated local evidence route until PostHog or the first-party collector is configured.
- Unlock production analytics with first-party-collector; 5 setup command(s) and 4 validation command(s) are published with redacted secret names only.
- Invite players to use Share evidence after a gate-sample play session so public aggregate evidence can be reviewed without raw events.
- Do not pass product gates, enable revenue, or submit stores from public aggregate notes alone.
- Keep product gates blocked until real player evidence clears completion, replay, and D1 retention thresholds.
