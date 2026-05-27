# Post-Deploy Artifact Sync

Generated: 2026-05-27T08:48:48.391Z
Status: post-deploy-artifact-sync-passed
Repository: moshequ/autonomous-game-lab
Workflow: web-pwa-deploy.yml
Run: 26500896057
Origin: https://moshequ.github.io/autonomous-game-lab/
Artifact candidate: pwa-72abaed5a28b
Live candidate: pwa-72abaed5a28b
Deployment freshness: current-head-deployed

## Summary

- Planned: 7
- Passed: 7
- Failed: 0
- Blocked: 0

## Validation

- artifactPassed: true
- artifactStrict: true
- artifactControlsReady: true
- artifactSummaryPassed: true
- liveMatchesArtifact: true

## Deployment Freshness

- currentHeadSha: 7d6b9238f3f42100e00109be2f37f99779bd2b09
- selectedRunHeadSha: 7d6b9238f3f42100e00109be2f37f99779bd2b09
- currentHeadDeployed: true
- currentHeadQueuedOrRunning: false
- liveMatchesCurrentLocalCandidate: false

## Checks

- pass: gh-cli - gh version 2.92.0 (2026-04-28)
- pass: github-repository - Target repository is moshequ/autonomous-game-lab.
- pass: successful-pages-run - Latest successful web-pwa-deploy.yml run is 26500896057.
- pass: post-deploy-smoke-artifact - Downloaded post-deploy-smoke artifact from run 26500896057.
- pass: strict-smoke-artifact - Artifact status post-deploy-smoke-passed; strict manifest comparison true; checks 34/34.
- pass: live-release-manifest - Live release-candidate.json still matches the strict smoke artifact.
- pass: deployment-freshness - Current main 7d6b9238f3f4 is deployed.

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
- currentHeadFreshnessTracked: true
- olderDeployNotTreatedAsCurrentHead: true

## Next Actions

- Current main is deployed; keep strict live artifact evidence in sync after each Pages run.
- Keep this strict deploy artifact as live-production evidence while local candidates continue to iterate.
- Keep revenue, paid acquisition, and store submission disabled until product, credential, and account gates pass.
