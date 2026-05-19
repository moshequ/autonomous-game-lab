#!/usr/bin/env bash
set -euo pipefail

if [[ "${AGL_ALLOW_REPOSITORY_BOOTSTRAP:-0}" != "1" ]]; then
  echo "Repository bootstrap is dry-run by default. Set AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 to apply guarded git/GitHub steps." >&2
  exit 2
fi

default_branch="${AGL_DEFAULT_BRANCH:-main}"
target_repo="${GITHUB_REPOSITORY:-${GH_REPO:-}}"

derive_repository_name() {
  node -e 'const fs=require("fs"); let name="autonomous-game-lab"; try { name=JSON.parse(fs.readFileSync("package.json","utf8")).name || name } catch {} name=String(name).split("/").pop().replace(/[^A-Za-z0-9._-]+/g,"-").replace(/^-+|-+$/g,"") || "autonomous-game-lab"; console.log(name)'
}

derive_repository_from_origin() {
  local remote_url
  remote_url="$(git remote get-url origin 2>/dev/null || true)"
  remote_url="${remote_url%/}"

  case "$remote_url" in
    https://github.com/*)
      remote_url="${remote_url#https://github.com/}"
      ;;
    git@github.com:*)
      remote_url="${remote_url#git@github.com:}"
      ;;
    ssh://git@github.com/*)
      remote_url="${remote_url#ssh://git@github.com/}"
      ;;
    *)
      return
      ;;
  esac

  remote_url="${remote_url%.git}"

  if [[ "$remote_url" =~ ^[^/[:space:]]+/[^/[:space:]]+$ ]]; then
    printf "%s" "$remote_url"
  fi
}

if [[ -z "$target_repo" ]]; then
  origin_repo="$(derive_repository_from_origin)"
  if [[ -n "$origin_repo" ]]; then
    target_repo="$origin_repo"
    echo "inferred GitHub repository target from origin: $target_repo"
  fi
fi

if [[ -z "$target_repo" && "${AGL_ALLOW_GH_INFER_REPOSITORY:-1}" == "1" ]] && command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  gh_owner="$(gh api user --jq .login 2>/dev/null || true)"
  if [[ -n "$gh_owner" ]]; then
    target_repo="$gh_owner/$(derive_repository_name)"
    echo "inferred GitHub repository target: $target_repo"
  fi
fi

ensure_git_identity() {
  if ! git config user.name >/dev/null 2>&1; then
    git config user.name "${AGL_GIT_AUTHOR_NAME:-Autonomous Game Lab Operator}"
  fi
  if ! git config user.email >/dev/null 2>&1; then
    git config user.email "${AGL_GIT_AUTHOR_EMAIL:-autonomous-game-lab@example.invalid}"
  fi
}

commit_current_snapshot() {
  local message="$1"
  if [[ -n "$(git status --short)" ]]; then
    ensure_git_identity
    git add .
    git commit -m "$message"
  else
    echo "working tree already has a clean committed snapshot"
  fi
}

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init -b "$default_branch" 2>/dev/null || git init
fi

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  if [[ "${AGL_ALLOW_INITIAL_COMMIT:-0}" == "1" ]]; then
    commit_current_snapshot "${AGL_INITIAL_COMMIT_MESSAGE:-Initial autonomous game lab snapshot}"
  else
    echo "skip initial commit: set AGL_ALLOW_INITIAL_COMMIT=1 to commit the current snapshot"
  fi
elif [[ "${AGL_ALLOW_SNAPSHOT_COMMIT:-0}" == "1" ]]; then
  commit_current_snapshot "${AGL_SNAPSHOT_COMMIT_MESSAGE:-Refresh autonomous production snapshot}"
fi

if [[ -n "$target_repo" && "${AGL_ALLOW_ORIGIN_REMOTE:-0}" == "1" ]]; then
  if ! git remote get-url origin >/dev/null 2>&1; then
    git remote add origin "https://github.com/$target_repo.git"
  else
    echo "origin remote already configured"
  fi
fi

if [[ "${AGL_ALLOW_GITHUB_REPO_CREATE:-0}" == "1" ]]; then
  if [[ -z "$target_repo" ]]; then
    echo "Set GITHUB_REPOSITORY or GH_REPO before creating a GitHub repository." >&2
    exit 1
  fi

  if ! command -v gh >/dev/null 2>&1; then
    echo "GitHub CLI (gh) is required for remote repository creation." >&2
    exit 1
  fi

  if ! gh auth status >/dev/null 2>&1; then
    echo "Authenticate gh or provide GH_TOKEN/GITHUB_TOKEN before creating a repository." >&2
    exit 1
  fi

  visibility="${AGL_GITHUB_VISIBILITY:-public}"
  if [[ "$visibility" != "public" && "$visibility" != "private" ]]; then
    echo "AGL_GITHUB_VISIBILITY must be public or private." >&2
    exit 1
  fi

  if gh repo view "$target_repo" >/dev/null 2>&1; then
    echo "GitHub repository $target_repo already exists"
  else
    create_args=("$target_repo" "--$visibility" "--source=." "--remote=origin")
    if [[ "${AGL_ALLOW_PUSH:-0}" == "1" ]]; then
      if [[ -n "$(git status --short)" ]]; then
        echo "working tree has uncommitted changes; set AGL_ALLOW_SNAPSHOT_COMMIT=1 before push." >&2
        exit 1
      fi
      create_args+=("--push")
    fi
    gh repo create "${create_args[@]}"
  fi
fi

if [[ "${AGL_ALLOW_PUSH:-0}" == "1" ]]; then
  if ! git remote get-url origin >/dev/null 2>&1; then
    echo "origin remote is required before push." >&2
    exit 1
  fi

  if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
    echo "a local commit is required before push." >&2
    exit 1
  fi

  if [[ -n "$(git status --short)" ]]; then
    echo "working tree has uncommitted changes; set AGL_ALLOW_SNAPSHOT_COMMIT=1 before push." >&2
    exit 1
  fi

  git push -u origin HEAD
else
  echo "skip push: set AGL_ALLOW_PUSH=1 to push the current branch"
fi

echo "Repository bootstrap completed for local/explicitly allowed steps. No workflows were dispatched."
