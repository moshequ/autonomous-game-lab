# Post-Deploy Smoke

Generated: 2026-05-23T03:51:13.853Z
Status: post-deploy-smoke-observed-live
Origin: https://moshequ.github.io/autonomous-game-lab
Origin source: release-candidate-public-origin
Candidate: pwa-aa635fc40a36
Live candidate: pwa-226a3ee37549

## Summary

- Planned: 26
- Passed: 26
- Failed: 0
- Blocked: 0

## Local Artifact Smoke

Status: predeploy-artifact-smoke-passed
Artifact path: dist
Checks: 26/26 passed
- pass: app-shell - dist/index.html - Local production artifact matched required text.
- pass: manifest-webmanifest - dist/manifest.webmanifest - Local production artifact matched required text.
- pass: sw-js - dist/sw.js - Local production artifact matched required text.
- pass: privacy-html - dist/privacy.html - Local production artifact matched required text.
- pass: support-html - dist/support.html - Local production artifact matched required text.
- pass: measurement-status-html - dist/measurement-status.html - Local production artifact matched required text.
- pass: measurement-status-json - dist/measurement-status.json - Local production artifact matched required text.
- pass: owner-unlock-brief-json - dist/owner-unlock-brief.json - Local production artifact matched required text.
- pass: analytics-unlock-html - dist/analytics-unlock.html - Local production artifact matched required text.
- pass: analytics-unlock-json - dist/analytics-unlock.json - Local production artifact matched required text.
- pass: install-html - dist/install.html - Local production artifact matched required text.
- pass: compliance-json - dist/compliance.json - Local production artifact matched required text.
- pass: monetization-json - dist/monetization.json - Local production artifact matched required text.
- pass: app-ads-txt - dist/app-ads.txt - Local production artifact matched required text.
- pass: well-known-assetlinks-json - dist/.well-known/assetlinks.json - Local production artifact matched required text.
- pass: gate-sample-html - dist/gate-sample.html - Local production artifact matched required text.
- pass: sample-next-html - dist/sample-next.html - Local production artifact matched required text.
- pass: sample-next-json - dist/sample-next.json - Local production artifact matched required text.
- pass: sample-fastest-html - dist/sample-fastest.html - Local production artifact matched required text.
- pass: sample-fastest-json - dist/sample-fastest.json - Local production artifact matched required text.
- pass: seed-kit-html - dist/seed-kit.html - Local production artifact matched required text.
- pass: seed-next-html - dist/seed-next.html - Local production artifact matched required text.
- pass: seed-next-json - dist/seed-next.json - Local production artifact matched required text.
- pass: sitemap-xml - dist/sitemap.xml - Local production artifact matched required text.
- pass: games-canopy-bloom-html - dist/games/canopy-bloom.html - Local production artifact matched required text.
- pass: release-candidate-manifest - dist/release-candidate.json - Local release manifest matches the release candidate.

## Checks

- pass: app-shell - https://moshequ.github.io/autonomous-game-lab/ - Live URL matched status and required text.
- pass: manifest-webmanifest - https://moshequ.github.io/autonomous-game-lab/manifest.webmanifest - Live URL matched status and required text.
- pass: sw-js - https://moshequ.github.io/autonomous-game-lab/sw.js - Live URL matched status and required text.
- pass: privacy-html - https://moshequ.github.io/autonomous-game-lab/privacy.html - Live URL matched status and required text.
- pass: support-html - https://moshequ.github.io/autonomous-game-lab/support.html - Live URL matched status and required text.
- pass: measurement-status-html - https://moshequ.github.io/autonomous-game-lab/measurement-status.html - Live URL matched status and required text.
- pass: measurement-status-json - https://moshequ.github.io/autonomous-game-lab/measurement-status.json - Live URL matched status and required text.
- pass: owner-unlock-brief-json - https://moshequ.github.io/autonomous-game-lab/owner-unlock-brief.json - Live URL matched status and required text.
- pass: analytics-unlock-html - https://moshequ.github.io/autonomous-game-lab/analytics-unlock.html - Live URL matched status and required text.
- pass: analytics-unlock-json - https://moshequ.github.io/autonomous-game-lab/analytics-unlock.json - Live URL matched status and required text.
- pass: install-html - https://moshequ.github.io/autonomous-game-lab/install.html - Live URL matched status and required text.
- pass: compliance-json - https://moshequ.github.io/autonomous-game-lab/compliance.json - Live URL matched status and required text.
- pass: monetization-json - https://moshequ.github.io/autonomous-game-lab/monetization.json - Live URL matched status and required text.
- pass: app-ads-txt - https://moshequ.github.io/autonomous-game-lab/app-ads.txt - Live URL matched status and required text.
- pass: well-known-assetlinks-json - https://moshequ.github.io/autonomous-game-lab/.well-known/assetlinks.json - Live URL matched status and required text.
- pass: gate-sample-html - https://moshequ.github.io/autonomous-game-lab/gate-sample.html - Live URL matched status and required text.
- pass: sample-next-html - https://moshequ.github.io/autonomous-game-lab/sample-next.html - Live URL matched status and required text.
- pass: sample-next-json - https://moshequ.github.io/autonomous-game-lab/sample-next.json - Live URL matched status and required text.
- pass: sample-fastest-html - https://moshequ.github.io/autonomous-game-lab/sample-fastest.html - Live URL matched status and required text.
- pass: sample-fastest-json - https://moshequ.github.io/autonomous-game-lab/sample-fastest.json - Live URL matched status and required text.
- pass: seed-kit-html - https://moshequ.github.io/autonomous-game-lab/seed-kit.html - Live URL matched status and required text.
- pass: seed-next-html - https://moshequ.github.io/autonomous-game-lab/seed-next.html - Live URL matched status and required text.
- pass: seed-next-json - https://moshequ.github.io/autonomous-game-lab/seed-next.json - Live URL matched status and required text.
- pass: sitemap-xml - https://moshequ.github.io/autonomous-game-lab/sitemap.xml - Live URL matched status and required text.
- pass: games-canopy-bloom-html - https://moshequ.github.io/autonomous-game-lab/games/canopy-bloom.html - Live URL matched status and required text.
- pass: release-candidate-manifest - https://moshequ.github.io/autonomous-game-lab/release-candidate.json - Live release manifest is reachable; it does not match the current local release candidate.

## Controls

- zeroPaidSpend: true
- noStoreSubmission: true
- noRevenueEnablement: true
- noAccountCreation: true
- readOnlyHttpChecks: true
- localArtifactSmokeRequired: true
- manifestHashComparisonRequired: true
- strictManifestComparison: false
- inferredLiveObservationAllowed: true

## Next Actions

- Live Pages is reachable and serving pwa-226a3ee37549; run the deploy workflow for strict proof of the current local candidate if needed.
- Keep revenue, paid acquisition, and app-store submission disabled until product and credential gates pass.
