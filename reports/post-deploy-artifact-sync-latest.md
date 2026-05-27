# Post-Deploy Artifact Sync

Generated: 2026-05-27T07:40:07.950Z
Status: post-deploy-artifact-sync-passed
Repository: moshequ/autonomous-game-lab
Workflow: web-pwa-deploy.yml
Run: 26497710478
Origin: https://moshequ.github.io/autonomous-game-lab/
Artifact candidate: pwa-c4c70da5b684
Live candidate: pwa-c4c70da5b684
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

- currentHeadSha: ce660fc8555c7f940c5eab7a475c7a0308e36b54
- selectedRunHeadSha: ce660fc8555c7f940c5eab7a475c7a0308e36b54
- currentHeadDeployed: true
- currentHeadQueuedOrRunning: false
- liveMatchesCurrentLocalCandidate: false

## Checks

- pass: gh-cli - gh version 2.92.0 (2026-04-28)
- pass: github-repository - Target repository is moshequ/autonomous-game-lab.
- pass: successful-pages-run - Latest successful web-pwa-deploy.yml run is 26497710478.
- pass: post-deploy-smoke-artifact - Downloaded post-deploy-smoke artifact from run 26497710478.
- pass: strict-smoke-artifact - Artifact status post-deploy-smoke-passed; strict manifest comparison true; checks 34/34.
- pass: live-release-manifest - Live release-candidate.json still matches the strict smoke artifact.
- pass: deployment-freshness - Current main ce660fc8555c is deployed.

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
