# Production Measurement Status

Generated: 2026-06-03T01:25:25.053Z
Status: production-measurement-blocked
Active path: local-browser-buffer
Live candidate: pwa-3e804a980eae
Exact live manifest: /release-candidate.json
Source hash: 09901c46d5f3

## Analytics

- rollup source: fixture-sample
- browser forwarding configured: false
- autonomous rollups configured: false
- local evidence ready: false
- public aggregate handoff: aggregate-evidence-channel-blocked
- analytics unlock: owner-input-required
- analytics unlock path: first-party-collector
- lowest-input analytics path: posthog-browser
- input watch UI: https://github.com/moshequ/autonomous-game-lab/actions/workflows/production-input-watch.yml
- external unlock queue: handoff-waiting-on-owner-inputs
- next external unlock: support-contact
- owner unlock brief: first-party-collector
- aggregate evidence notes: 0
- supporting aggregate mission notes: 0
- player evidence invite pack: player-evidence-invite-pack-blocked
- player evidence primary route: /sample-next.html
- player evidence follow-up: npm run autonomous:collect-local-event-drops && npm run autonomous:player-evidence-watchdog && npm run autonomous:measurement-status
- measurement page export: measurement-page-export-needs-bridge
- measurement page export import: npm run autonomous:collect-local-event-drops

## Public Routes

- statusPage: /measurement-status.html
- statusJson: /measurement-status.json
- analyticsUnlock: /analytics-unlock.html
- analyticsUnlockJson: /analytics-unlock.json
- ownerRuntimeConfig: /owner-runtime-config.json
- ownerUnlockPreflightJson: /owner-unlock-preflight.json
- productGateRecovery: /product-gate-recovery.html
- productGateRecoveryJson: /product-gate-recovery.json
- gateSample: /gate-sample.html
- sampleNext: /sample-next.html
- sampleNextJson: /sample-next.json
- sampleFastest: /sample-fastest.html
- sampleFastestJson: /sample-fastest.json
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
- measurementPageLocalEventDropExport: true
- noStoreSubmission: true
- noRevenueEnablement: true

## Next Actions

- Repair the support or local event bridge route before relying on production evidence.
- Unlock production analytics with first-party-collector; minimal-intervention path is posthog-browser with 1 missing input(s) and 0 secret(s).
- First-party collector deployment is blocked-needs-cloudflare-env; smoke is pass.
- External unlock queue has 5 owner action(s); next zero-spend unlock is support-contact.
- Product gate recovery is product-gate-recovery-ready; public recovery route is /product-gate-recovery.html.
- Invite players to start the current sample through /sample-next.html, or the fastest separate gate through /sample-fastest.html, then use Share evidence after the play session so public aggregate evidence can be reviewed without raw events.
- Do not pass product gates, enable revenue, or submit stores from public aggregate notes alone.
- Keep product gates blocked until real player evidence clears completion, replay, and D1 retention thresholds.
