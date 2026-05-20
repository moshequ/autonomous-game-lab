# Repository Readiness

Generated: 2026-05-20T05:03:08.694Z
Status: waiting-for-github-repository
Workspace: /Users/moshequ/Documents/Codex/2026-05-18/i-want-to-have-a-new
Repository: missing
Planned target: OWNER/autonomous-game-lab
Planned Pages origin: https://OWNER.github.io/autonomous-game-lab

## Checks

- pass: local-git-worktree - Git worktree detected at /Users/moshequ/Documents/Codex/2026-05-18/i-want-to-have-a-new.
- blocker: github-target - Set GITHUB_REPOSITORY/GH_REPO, add a GitHub origin remote, or authenticate gh so the target can be inferred.
- blocker: origin-remote - No GitHub origin remote is available from this workspace.
- pass: gh-cli - gh version 2.90.0 (2026-04-16)
- external-blocker: gh-token - Authenticate GitHub CLI or configure GH_TOKEN/GITHUB_TOKEN for non-interactive workflow dispatch.
- pass: pages-workflow - Web PWA Deploy workflow exists and includes post-deploy smoke.
- pass: deployable-artifact - Deployment ready-for-pages; release candidate release-candidate-ready; smoke blocked-missing-origin.

## Controls

- zeroPaidSpend: true
- readOnlyLocalInspection: true
- noGitMutation: true
- noWorkflowDispatch: true
- noAccountCreation: true
- noStoreSubmission: true
- noRevenueEnablement: true

## Setup Required Once

- Create or attach repository target: OWNER/autonomous-game-lab
- GitHub create URL: https://github.com/new?name=autonomous-game-lab&visibility=public
- Attach origin command: GITHUB_REPOSITORY=OWNER/autonomous-game-lab AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 AGL_ALLOW_ORIGIN_REMOTE=1 ./ops/github/bootstrap-repository.sh
- Add a GitHub origin remote, set GITHUB_REPOSITORY/GH_REPO to owner/repo, set AGL_GITHUB_OWNER to infer owner/package-name, or authenticate gh.
- Authenticate GitHub CLI or provide GH_TOKEN/GITHUB_TOKEN before non-interactive workflow dispatch.
- Let the production bootstrap helper enable GitHub Pages with GitHub Actions as the source once gh credentials exist.

## Blockers

- Add a GitHub origin remote, set GITHUB_REPOSITORY/GH_REPO, set AGL_GITHUB_OWNER, or authenticate gh to infer the target repository.
- Authenticate GitHub CLI or configure GH_TOKEN/GITHUB_TOKEN for workflow dispatch and repository settings sync.
