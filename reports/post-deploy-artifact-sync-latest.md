# Post-Deploy Artifact Sync

Generated: 2026-05-25T07:17:17.218Z
Status: post-deploy-artifact-sync-passed
Repository: moshequ/autonomous-game-lab
Workflow: web-pwa-deploy.yml
Run: 26388427980
Origin: https://moshequ.github.io/autonomous-game-lab/
Artifact candidate: pwa-a4cd438e1770
Live candidate: pwa-a4cd438e1770

## Summary

- Planned: 6
- Passed: 6
- Failed: 0
- Blocked: 0

## Validation

- artifactPassed: true
- artifactStrict: true
- artifactControlsReady: true
- artifactSummaryPassed: true
- liveMatchesArtifact: true

## Checks

- pass: gh-cli - gh version 2.92.0 (2026-04-28)
- pass: github-repository - Target repository is moshequ/autonomous-game-lab.
- pass: successful-pages-run - Latest successful web-pwa-deploy.yml run is 26388427980.
- pass: post-deploy-smoke-artifact - Downloaded post-deploy-smoke artifact from run 26388427980.
- pass: strict-smoke-artifact - Artifact status post-deploy-smoke-passed; strict manifest comparison true; checks 32/32.
- pass: live-release-manifest - Live release-candidate.json still matches the strict smoke artifact.

## Controls

- zeroPaidSpend: true
- noWorkflowDispatch: true
- noStoreSubmission: true
- noRevenueEnablement: true
- noAccountCreation: true
- readOnlyGithubArtifactDownload: true
- readOnlyHttpChecks: true
- strictManifestComparisonRequired: true
- separateFromLocalCandidate: true
- noPostDeployReleaseRefresh: true

## Next Actions

- Keep this strict deploy artifact as live-production evidence while local candidates continue to iterate.
- Keep revenue, paid acquisition, and store submission disabled until product, credential, and account gates pass.
