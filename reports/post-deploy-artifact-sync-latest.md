# Post-Deploy Artifact Sync

Generated: 2026-05-23T08:39:15.152Z
Status: post-deploy-artifact-sync-passed
Repository: moshequ/autonomous-game-lab
Workflow: web-pwa-deploy.yml
Run: 26328298839
Origin: https://moshequ.github.io/autonomous-game-lab
Artifact candidate: pwa-18ddd519af3b
Live candidate: pwa-18ddd519af3b

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
- pass: explicit-pages-run - Explicit web-pwa-deploy.yml run is 26328298839.
- pass: post-deploy-smoke-artifact - Downloaded post-deploy-smoke artifact from run 26328298839.
- pass: strict-smoke-artifact - Artifact status post-deploy-smoke-passed; strict manifest comparison true; checks 26/26.
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
