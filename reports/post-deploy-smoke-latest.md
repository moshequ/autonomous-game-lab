# Post-Deploy Smoke

Generated: 2026-05-19T02:03:11.977Z
Status: blocked-missing-origin
Origin: missing
Candidate: pwa-d5ff5976c0cb

## Summary

- Planned: 8
- Passed: 0
- Failed: 0
- Blocked: 8

## Checks

- blocked: app-shell - ${DEPLOYED_PWA_ORIGIN}/ - No deployed origin configured.
- blocked: manifest-webmanifest - ${DEPLOYED_PWA_ORIGIN}/manifest.webmanifest - No deployed origin configured.
- blocked: sw-js - ${DEPLOYED_PWA_ORIGIN}/sw.js - No deployed origin configured.
- blocked: privacy-html - ${DEPLOYED_PWA_ORIGIN}/privacy.html - No deployed origin configured.
- blocked: support-html - ${DEPLOYED_PWA_ORIGIN}/support.html - No deployed origin configured.
- blocked: sitemap-xml - ${DEPLOYED_PWA_ORIGIN}/sitemap.xml - No deployed origin configured.
- blocked: games-canopy-bloom-html - ${DEPLOYED_PWA_ORIGIN}/games/canopy-bloom.html - No deployed origin configured.
- blocked: release-candidate-manifest - ${DEPLOYED_PWA_ORIGIN}/release-candidate.json - No deployed origin configured.

## Controls

- zeroPaidSpend: true
- noStoreSubmission: true
- noRevenueEnablement: true
- noAccountCreation: true
- readOnlyHttpChecks: true
- manifestHashComparisonRequired: true

## Next Actions

- Run this after deployment with AGL_DEPLOYED_PWA_ORIGIN set to the Pages URL.
- Keep revenue, paid acquisition, and app-store submission disabled until product and credential gates pass.
