# Post-Deploy Smoke

Generated: 2026-05-19T22:04:24.296Z
Status: blocked-missing-origin
Origin: missing
Candidate: pwa-cd380eeb15b1

## Summary

- Planned: 12
- Passed: 0
- Failed: 0
- Blocked: 12

## Local Artifact Smoke

Status: predeploy-artifact-smoke-passed
Artifact path: dist
Checks: 12/12 passed
- pass: app-shell - dist/index.html - Local production artifact matched required text.
- pass: manifest-webmanifest - dist/manifest.webmanifest - Local production artifact matched required text.
- pass: sw-js - dist/sw.js - Local production artifact matched required text.
- pass: privacy-html - dist/privacy.html - Local production artifact matched required text.
- pass: support-html - dist/support.html - Local production artifact matched required text.
- pass: compliance-json - dist/compliance.json - Local production artifact matched required text.
- pass: monetization-json - dist/monetization.json - Local production artifact matched required text.
- pass: app-ads-txt - dist/app-ads.txt - Local production artifact matched required text.
- pass: seed-kit-html - dist/seed-kit.html - Local production artifact matched required text.
- pass: sitemap-xml - dist/sitemap.xml - Local production artifact matched required text.
- pass: games-canopy-bloom-html - dist/games/canopy-bloom.html - Local production artifact matched required text.
- pass: release-candidate-manifest - dist/release-candidate.json - Local release manifest matches the release candidate.

## Checks

- blocked: app-shell - ${DEPLOYED_PWA_ORIGIN}/ - No deployed origin configured.
- blocked: manifest-webmanifest - ${DEPLOYED_PWA_ORIGIN}/manifest.webmanifest - No deployed origin configured.
- blocked: sw-js - ${DEPLOYED_PWA_ORIGIN}/sw.js - No deployed origin configured.
- blocked: privacy-html - ${DEPLOYED_PWA_ORIGIN}/privacy.html - No deployed origin configured.
- blocked: support-html - ${DEPLOYED_PWA_ORIGIN}/support.html - No deployed origin configured.
- blocked: compliance-json - ${DEPLOYED_PWA_ORIGIN}/compliance.json - No deployed origin configured.
- blocked: monetization-json - ${DEPLOYED_PWA_ORIGIN}/monetization.json - No deployed origin configured.
- blocked: app-ads-txt - ${DEPLOYED_PWA_ORIGIN}/app-ads.txt - No deployed origin configured.
- blocked: seed-kit-html - ${DEPLOYED_PWA_ORIGIN}/seed-kit.html - No deployed origin configured.
- blocked: sitemap-xml - ${DEPLOYED_PWA_ORIGIN}/sitemap.xml - No deployed origin configured.
- blocked: games-canopy-bloom-html - ${DEPLOYED_PWA_ORIGIN}/games/canopy-bloom.html - No deployed origin configured.
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
