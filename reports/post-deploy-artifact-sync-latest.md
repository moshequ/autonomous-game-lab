# Post-Deploy Artifact Sync

Generated: 2026-06-11T02:47:42.814Z
Status: post-deploy-artifact-sync-passed
Repository: moshequ/autonomous-game-lab
Workflow: web-pwa-deploy.yml
Run: 26887865130
Origin: https://moshequ.github.io/autonomous-game-lab/
Artifact candidate: pwa-b2cb4bc35a26
Live candidate: pwa-b2cb4bc35a26
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

- currentHeadSha: 0cd67d9d6259268926086eba8ac95697f4b224c3
- selectedRunHeadSha: af6277a15a3efe0b38ee16c4c4173ffbf2814cdc
- currentHeadDeployed: false
- currentHeadQueuedOrRunning: false
- liveMatchesCurrentLocalCandidate: false

## Checks

- pass: gh-cli - gh version 2.92.0 (2026-04-28)
- pass: github-repository - Target repository is moshequ/autonomous-game-lab.
- pass: successful-pages-run - Latest successful web-pwa-deploy.yml run is 26887865130.
- pass: post-deploy-smoke-artifact - Downloaded post-deploy-smoke artifact from run 26887865130.
- pass: strict-smoke-artifact - Artifact status post-deploy-smoke-passed; strict manifest comparison true; checks 34/34.
- pass: live-release-manifest - Live release-candidate.json still matches the strict smoke artifact.
- monitor: deployment-freshness - Current main 0cd67d9d6259 is not the latest strict deployed artifact; freshness current-head-not-deployed.

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
