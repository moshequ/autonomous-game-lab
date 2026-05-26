# Post-Deploy Artifact Sync

Generated: 2026-05-26T18:42:50.899Z
Status: post-deploy-artifact-sync-passed
Repository: moshequ/autonomous-game-lab
Workflow: web-pwa-deploy.yml
Run: 26467913330
Origin: https://moshequ.github.io/autonomous-game-lab/
Artifact candidate: pwa-74520c998eae
Live candidate: pwa-74520c998eae
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

- currentHeadSha: 59236dcf06e8147da58539105309d97e21ce22be
- selectedRunHeadSha: 59236dcf06e8147da58539105309d97e21ce22be
- currentHeadDeployed: true
- currentHeadQueuedOrRunning: false
- liveMatchesCurrentLocalCandidate: false

## Checks

- pass: gh-cli - gh version 2.92.0 (2026-04-28)
- pass: github-repository - Target repository is moshequ/autonomous-game-lab.
- pass: successful-pages-run - Latest successful web-pwa-deploy.yml run is 26467913330.
- pass: post-deploy-smoke-artifact - Downloaded post-deploy-smoke artifact from run 26467913330.
- pass: strict-smoke-artifact - Artifact status post-deploy-smoke-passed; strict manifest comparison true; checks 34/34.
- pass: live-release-manifest - Live release-candidate.json still matches the strict smoke artifact.
- pass: deployment-freshness - Current main 59236dcf06e8 is deployed.

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
