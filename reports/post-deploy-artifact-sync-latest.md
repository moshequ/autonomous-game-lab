# Post-Deploy Artifact Sync

Generated: 2026-05-27T05:57:51.877Z
Status: post-deploy-artifact-sync-passed
Repository: moshequ/autonomous-game-lab
Workflow: web-pwa-deploy.yml
Run: 26491912623
Origin: https://moshequ.github.io/autonomous-game-lab/
Artifact candidate: pwa-0fcbf647ce36
Live candidate: pwa-0fcbf647ce36
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

- currentHeadSha: 8b09c4fb47ca8ba4129ef59a098c31c51d5348bf
- selectedRunHeadSha: 9ed2f2e74d2ca4bd2c2e6b7e306af83e95afc09f
- currentHeadDeployed: false
- currentHeadQueuedOrRunning: false
- liveMatchesCurrentLocalCandidate: false

## Checks

- pass: gh-cli - gh version 2.92.0 (2026-04-28)
- pass: github-repository - Target repository is moshequ/autonomous-game-lab.
- pass: successful-pages-run - Latest successful web-pwa-deploy.yml run is 26491912623.
- pass: post-deploy-smoke-artifact - Downloaded post-deploy-smoke artifact from run 26491912623.
- pass: strict-smoke-artifact - Artifact status post-deploy-smoke-passed; strict manifest comparison true; checks 34/34.
- pass: live-release-manifest - Live release-candidate.json still matches the strict smoke artifact.
- monitor: deployment-freshness - Current main 8b09c4fb47ca is not the latest strict deployed artifact; freshness current-head-not-deployed.

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
