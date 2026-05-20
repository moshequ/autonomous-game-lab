# Post-Deploy Smoke

Generated: 2026-05-20T11:40:44.071Z
Status: blocked-missing-origin
Origin: missing
Candidate: pwa-59bd009c27ce

## Summary

- Planned: 15
- Passed: 0
- Failed: 0
- Blocked: 15

## Local Artifact Smoke

Status: predeploy-artifact-smoke-passed
Artifact path: dist
Checks: 15/15 passed
- pass: app-shell - dist/index.html - Local production artifact matched required text.
- pass: manifest-webmanifest - dist/manifest.webmanifest - Local production artifact matched required text.
- pass: sw-js - dist/sw.js - Local production artifact matched required text.
- pass: privacy-html - dist/privacy.html - Local production artifact matched required text.
- pass: support-html - dist/support.html - Local production artifact matched required text.
- pass: install-html - dist/install.html - Local production artifact matched required text.
- pass: compliance-json - dist/compliance.json - Local production artifact matched required text.
- pass: monetization-json - dist/monetization.json - Local production artifact matched required text.
- pass: app-ads-txt - dist/app-ads.txt - Local production artifact matched required text.
- pass: well-known-assetlinks-json - dist/.well-known/assetlinks.json - Local production artifact matched required text.
- pass: gate-sample-html - dist/gate-sample.html - Local production artifact matched required text.
- pass: seed-kit-html - dist/seed-kit.html - Local production artifact matched required text.
- pass: sitemap-xml - dist/sitemap.xml - Local production artifact matched required text.
- pass: games-canopy-bloom-html - dist/games/canopy-bloom.html - Local production artifact matched required text.
- pass: release-candidate-manifest - dist/release-candidate.json - Local release manifest matches the release candidate.

## Checks

- blocked: app-shell - https://moshequ.github.io/autonomous-game-lab/ - No deployed origin configured.
- blocked: manifest-webmanifest - https://moshequ.github.io/autonomous-game-lab/manifest.webmanifest - No deployed origin configured.
- blocked: sw-js - https://moshequ.github.io/autonomous-game-lab/sw.js - No deployed origin configured.
- blocked: privacy-html - https://moshequ.github.io/autonomous-game-lab/privacy.html - No deployed origin configured.
- blocked: support-html - https://moshequ.github.io/autonomous-game-lab/support.html - No deployed origin configured.
- blocked: install-html - https://moshequ.github.io/autonomous-game-lab/install.html - No deployed origin configured.
- blocked: compliance-json - https://moshequ.github.io/autonomous-game-lab/compliance.json - No deployed origin configured.
- blocked: monetization-json - https://moshequ.github.io/autonomous-game-lab/monetization.json - No deployed origin configured.
- blocked: app-ads-txt - https://moshequ.github.io/autonomous-game-lab/app-ads.txt - No deployed origin configured.
- blocked: well-known-assetlinks-json - https://moshequ.github.io/autonomous-game-lab/.well-known/assetlinks.json - No deployed origin configured.
- blocked: gate-sample-html - https://moshequ.github.io/autonomous-game-lab/gate-sample.html - No deployed origin configured.
- blocked: seed-kit-html - https://moshequ.github.io/autonomous-game-lab/seed-kit.html - No deployed origin configured.
- blocked: sitemap-xml - https://moshequ.github.io/autonomous-game-lab/sitemap.xml - No deployed origin configured.
- blocked: games-canopy-bloom-html - https://moshequ.github.io/autonomous-game-lab/games/canopy-bloom.html - No deployed origin configured.
- blocked: release-candidate-manifest - ${DEPLOYED_PWA_ORIGIN}/release-candidate.json - No deployed origin configured.

## Controls

- zeroPaidSpend: true
- noStoreSubmission: true
- noRevenueEnablement: true
- noAccountCreation: true
- readOnlyHttpChecks: true
- localArtifactSmokeRequired: true
- manifestHashComparisonRequired: true

## Next Actions

- Run this after deployment with AGL_DEPLOYED_PWA_ORIGIN set to the Pages URL.
- Keep revenue, paid acquisition, and app-store submission disabled until product and credential gates pass.
