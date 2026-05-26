# Post-Deploy Artifact Sync

Generated: 2026-05-26T15:08:03.407Z
Status: post-deploy-artifact-sync-passed
Repository: moshequ/autonomous-game-lab
Workflow: web-pwa-deploy.yml
Run: 26456067294
Origin: https://moshequ.github.io/autonomous-game-lab/
Artifact candidate: pwa-3a788f4bc931
Live candidate: pwa-3a788f4bc931
Deployment freshness: current-head-not-deployed

## Summary

- Planned: 7
- Passed: 6
- Failed: 0
- Blocked: 0

## Validation

- artifactPassed: true
- artifactStrict: true
- artifactControlsReady: true
- artifactSummaryPassed: true
- liveMatchesArtifact: true

## Deployment Freshness

- currentHeadSha: 4b7ba6de1f73b35d41308c0fe8c7192d2ded7cb0
- selectedRunHeadSha: ff6000292fe812a934d3cda3230d72c711500527
- currentHeadDeployed: false
- currentHeadQueuedOrRunning: false
- liveMatchesCurrentLocalCandidate: false

## Checks

- pass: gh-cli - gh version 2.92.0 (2026-04-28)
- pass: github-repository - Target repository is moshequ/autonomous-game-lab.
- pass: successful-pages-run - Latest successful web-pwa-deploy.yml run is 26456067294.
- pass: post-deploy-smoke-artifact - Downloaded post-deploy-smoke artifact from run 26456067294.
- pass: strict-smoke-artifact - Artifact status post-deploy-smoke-passed; strict manifest comparison true; checks 34/34.
- pass: live-release-manifest - Live release-candidate.json still matches the strict smoke artifact.
- monitor: deployment-freshness - Current main 4b7ba6de1f73 is not the latest strict deployed artifact; freshness current-head-not-deployed.

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

- Wait for or rerun Web PWA Deploy before treating the current main head as live; the previous deployed artifact remains valid but stale for the current commit.
- Keep this strict deploy artifact as live-production evidence while local candidates continue to iterate.
- Keep revenue, paid acquisition, and store submission disabled until product, credential, and account gates pass.
