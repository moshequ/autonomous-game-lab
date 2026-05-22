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

if [[ "${AGL_SYNC_ROOT_ASSETLINKS:-0}" != "1" ]]; then
  echo "dry-run only; set AGL_SYNC_ROOT_ASSETLINKS=1 to sync the root Digital Asset Links file"
  exit 0
fi

WORKDIR="$(mktemp -d)"
cleanup() {
  rm -rf "$WORKDIR"
}
trap cleanup EXIT

gh repo view "$TARGET_REPO" >/dev/null
gh repo clone "$TARGET_REPO" "$WORKDIR/repo" -- --depth 1 --branch "$TARGET_BRANCH"
mkdir -p "$WORKDIR/repo/.well-known"
cp "$SOURCE_FILE" "$WORKDIR/repo/$TARGET_FILE"

cd "$WORKDIR/repo"
if git diff --quiet -- "$TARGET_FILE"; then
  echo "root Digital Asset Links already current"
  exit 0
fi

git config user.name "autonomous-game-lab-bot"
git config user.email "autonomous-game-lab-bot@users.noreply.github.com"
git add "$TARGET_FILE"
git commit -m "Sync Android Digital Asset Links"
git push origin "HEAD:$TARGET_BRANCH"
