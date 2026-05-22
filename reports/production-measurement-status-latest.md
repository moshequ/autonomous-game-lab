# Production Measurement Status

Generated: 2026-05-22T23:22:40.179Z
Status: production-measurement-local-intake-ready
Active path: local-browser-buffer
Live candidate: pwa-ea9816841e2a
Exact live manifest: /release-candidate.json
Source hash: e45da7c09cd1

## Analytics

- rollup source: fixture-sample
- browser forwarding configured: false
- autonomous rollups configured: false
- local evidence ready: true
- public aggregate handoff: awaiting-player-initiated-aggregate-notes
- analytics unlock: owner-input-required
- analytics unlock path: first-party-collector
- external unlock queue: handoff-waiting-on-owner-inputs
- next external unlock: production-analytics-browser
- aggregate evidence notes: 0
- supporting aggregate mission notes: 0

## Public Routes

- statusPage: /measurement-status.html
- statusJson: /measurement-status.json
- analyticsUnlock: /analytics-unlock.html
- analyticsUnlockJson: /analytics-unlock.json
- gateSample: /gate-sample.html
- sampleNext: /sample-next.html
- sampleNextJson: /sample-next.json
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
- External unlock queue has 4 owner action(s); next zero-spend unlock is production-analytics-browser.
- Invite players to start the current sample through /sample-next.html, then use Share evidence after the play session so public aggregate evidence can be reviewed without raw events.
- Do not pass product gates, enable revenue, or submit stores from public aggregate notes alone.
- Keep product gates blocked until real player evidence clears completion, replay, and D1 retention thresholds.
