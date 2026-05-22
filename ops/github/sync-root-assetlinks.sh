#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SOURCE_FILE="$ROOT_DIR/public/.well-known/assetlinks.json"
TARGET_REPO="${AGL_ROOT_ASSETLINKS_REPOSITORY:-moshequ/moshequ.github.io}"
TARGET_BRANCH="${AGL_ROOT_ASSETLINKS_BRANCH:-main}"
TARGET_FILE=".well-known/assetlinks.json"

if [[ ! -s "$SOURCE_FILE" ]]; then
  echo "missing source assetlinks file: $SOURCE_FILE" >&2
  exit 1
fi

if [[ -z "$TARGET_REPO" ]]; then
  echo "set AGL_ROOT_ASSETLINKS_REPOSITORY to <owner>/<owner>.github.io" >&2
  exit 1
fi

echo "source: $SOURCE_FILE"
echo "target: $TARGET_REPO:$TARGET_BRANCH:$TARGET_FILE"
echo "create repo: ${AGL_ALLOW_ROOT_ASSETLINKS_REPO_CREATE:-0}"
echo "configure pages: ${AGL_SYNC_ROOT_ASSETLINKS_PAGES:-0}"

if [[ "${AGL_SYNC_ROOT_ASSETLINKS:-0}" != "1" ]]; then
  echo "dry-run only; set AGL_SYNC_ROOT_ASSETLINKS=1 to sync the root Digital Asset Links file"
  exit 0
fi

WORKDIR="$(mktemp -d)"
cleanup() {
  rm -rf "$WORKDIR"
}
trap cleanup EXIT

if ! gh repo view "$TARGET_REPO" >/dev/null 2>&1; then
  if [[ "${AGL_ALLOW_ROOT_ASSETLINKS_REPO_CREATE:-0}" != "1" ]]; then
    echo "target repository does not exist; set AGL_ALLOW_ROOT_ASSETLINKS_REPO_CREATE=1 to create the free root Pages repository" >&2
    exit 1
  fi

  gh repo create "$TARGET_REPO" --public --description "Root GitHub Pages host for Autonomous Game Lab Android Digital Asset Links"
fi

if ! gh repo clone "$TARGET_REPO" "$WORKDIR/repo" -- --depth 1 --branch "$TARGET_BRANCH"; then
  mkdir -p "$WORKDIR/repo"
  cd "$WORKDIR/repo"
  git init
  git checkout -B "$TARGET_BRANCH"
  git remote add origin "git@github.com:$TARGET_REPO.git"
  cd "$ROOT_DIR"
fi

mkdir -p "$WORKDIR/repo/.well-known"
cp "$SOURCE_FILE" "$WORKDIR/repo/$TARGET_FILE"
touch "$WORKDIR/repo/.nojekyll"

cd "$WORKDIR/repo"
if [[ -z "$(git status --porcelain -- "$TARGET_FILE" ".nojekyll")" ]]; then
  echo "root Digital Asset Links already current"
else
  git config user.name "autonomous-game-lab-bot"
  git config user.email "autonomous-game-lab-bot@users.noreply.github.com"
  git add "$TARGET_FILE" ".nojekyll"
  git commit -m "Sync Android Digital Asset Links"
  git push origin "HEAD:$TARGET_BRANCH"
fi

if [[ "${AGL_SYNC_ROOT_ASSETLINKS_PAGES:-0}" == "1" ]]; then
  if gh api "repos/$TARGET_REPO/pages" >/dev/null 2>&1; then
    echo "GitHub Pages already configured for $TARGET_REPO"
  else
    gh api --method POST "repos/$TARGET_REPO/pages" -F "source[branch]=$TARGET_BRANCH" -F "source[path]=/" >/dev/null ||
      echo "GitHub Pages API did not confirm configuration; user Pages repositories may activate from the default branch automatically"
  fi
fi
