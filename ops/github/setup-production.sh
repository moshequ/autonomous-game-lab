#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "--owner-unlock-brief" || "${1:-}" == "--next-brief" ]]; then
  node scripts/owner-unlock-brief.mjs --print
  exit 0
fi

if [[ "${1:-}" == "--owner-unlock-preflight" || "${1:-}" == "--preflight" ]]; then
  node scripts/owner-unlock-preflight.mjs --assert --print
  exit 0
fi

if [[ "${1:-}" == "--owner-input-template" || "${1:-}" == "--combined-owner-input-template" || "${1:-}" == "--write-owner-input-template" ]]; then
  node scripts/owner-unlock-preflight.mjs --write-local-env-template --print
  exit 0
fi

if [[ "${1:-}" == "--support-input-template" || "${1:-}" == "--support-contact-template" || "${1:-}" == "--write-support-input-template" ]]; then
  node scripts/store-readiness-page.mjs --write-local-env-template --print
  exit 0
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Authenticate GitHub CLI before syncing production settings." >&2
  exit 1
fi

repo="${GITHUB_REPOSITORY:-${GH_REPO:-}}"
owner_hint="${AGL_GITHUB_OWNER:-${GITHUB_REPOSITORY_OWNER:-${GITHUB_OWNER:-}}}"

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

derive_repository_from_owner_hint() {
  local owner="$1"
  if [[ "$owner" =~ ^[A-Za-z0-9]([A-Za-z0-9-]{0,37}[A-Za-z0-9])?$ ]]; then
    printf "%s/%s" "$owner" "$(derive_repository_name)"
  fi
}

derive_github_pages_origin() {
  local target="$1"
  local owner="${target%%/*}"
  local name="${target#*/}"
  if [[ "$name" == "$owner.github.io" ]]; then
    printf "https://%s.github.io" "$owner"
  else
    printf "https://%s.github.io/%s" "$owner" "$name"
  fi
}

derive_github_pages_base_path() {
  local target="$1"
  local owner="${target%%/*}"
  local name="${target#*/}"
  if [[ "$name" == "$owner.github.io" ]]; then
    printf "/"
  else
    printf "/%s/" "$name"
  fi
}

if [[ -z "$repo" ]]; then
  origin_repo="$(derive_repository_from_origin)"
  if [[ -n "$origin_repo" ]]; then
    repo="$origin_repo"
    echo "inferred GitHub repository target from origin: $repo"
  fi
fi

if [[ -z "$repo" && -n "$owner_hint" ]]; then
  owner_repo="$(derive_repository_from_owner_hint "$owner_hint")"
  if [[ -n "$owner_repo" ]]; then
    repo="$owner_repo"
    echo "inferred GitHub repository target from owner hint: $repo"
  fi
fi

if [[ -z "$repo" && "${AGL_ALLOW_GH_INFER_REPOSITORY:-1}" == "1" ]]; then
  gh_owner="$(gh api user --jq .login 2>/dev/null || true)"
  if [[ -n "$gh_owner" ]]; then
    repo="$gh_owner/$(derive_repository_name)"
    echo "inferred GitHub repository target: $repo"
  fi
fi

if [[ -z "$repo" ]]; then
  echo "Set GITHUB_REPOSITORY/GH_REPO, add a GitHub origin remote, set AGL_GITHUB_OWNER, or authenticate gh so owner/package-name can be inferred." >&2
  exit 1
fi

if [[ "$repo" =~ ^[A-Za-z0-9]([A-Za-z0-9-]{0,37}[A-Za-z0-9])?/[^/[:space:]]+$ && "${AGL_INFER_GITHUB_PAGES_ORIGIN:-1}" == "1" ]]; then
  if [[ -z "${AGL_PUBLIC_ORIGIN:-}" ]]; then
    AGL_PUBLIC_ORIGIN="$(derive_github_pages_origin "$repo")"
    export AGL_PUBLIC_ORIGIN
    echo "inferred AGL_PUBLIC_ORIGIN from GitHub Pages target: $AGL_PUBLIC_ORIGIN"
  fi

  if [[ -z "${VITE_BASE_PATH:-}" ]]; then
    VITE_BASE_PATH="$(derive_github_pages_base_path "$repo")"
    export VITE_BASE_PATH
    echo "inferred VITE_BASE_PATH from GitHub Pages target: $VITE_BASE_PATH"
  fi
fi

repo_args=(--repo "$repo")

set_variable() {
  local repo_name="$1"
  local env_name="$2"
  local value="${!env_name:-}"
  if [[ -n "$value" ]]; then
    gh variable set "$repo_name" --body "$value" "${repo_args[@]}"
  else
    echo "skip variable $repo_name: $env_name is not set"
  fi
}

set_secret() {
  local repo_name="$1"
  local env_name="$2"
  local value="${!env_name:-}"
  if [[ -n "$value" ]]; then
    printf "%s" "$value" | gh secret set "$repo_name" "${repo_args[@]}"
  else
    echo "skip secret $repo_name: $env_name is not set"
  fi
}

all_present() {
  local name
  for name in "$@"; do
    if [[ -z "${!name:-}" ]]; then
      return 1
    fi
  done
}

sync_pages_settings() {
  if [[ "${AGL_SYNC_PAGES_SETTINGS:-1}" != "1" ]]; then
    echo "skip GitHub Pages settings: AGL_SYNC_PAGES_SETTINGS is not 1"
    return
  fi

  if gh api "repos/$repo/pages" >/dev/null 2>&1; then
    gh api --method PUT "repos/$repo/pages" -f build_type=workflow -F https_enforced=true >/dev/null ||
      echo "GitHub Pages HTTPS enforcement pending for $repo; certificate may still be provisioning."
    echo "GitHub Pages source set to Actions workflow for $repo"
  else
    gh api --method POST "repos/$repo/pages" -f build_type=workflow >/dev/null
    gh api --method PUT "repos/$repo/pages" -f build_type=workflow -F https_enforced=true >/dev/null ||
      echo "GitHub Pages HTTPS enforcement pending for $repo; certificate may still be provisioning."
    echo "GitHub Pages site created for workflow deployment on $repo"
  fi
}

set_variable "VITE_BASE_PATH" "VITE_BASE_PATH"
set_variable "AGL_PUBLIC_ORIGIN" "AGL_PUBLIC_ORIGIN"
set_variable "VITE_PUBLIC_ORIGIN" "AGL_PUBLIC_ORIGIN"
set_variable "PUBLIC_SITE_URL" "AGL_PUBLIC_ORIGIN"
set_variable "AGL_SUPPORT_EMAIL" "AGL_SUPPORT_EMAIL"
set_variable "VITE_POSTHOG_KEY" "VITE_POSTHOG_KEY"
set_variable "VITE_POSTHOG_HOST" "VITE_POSTHOG_HOST"
set_variable "POSTHOG_PROJECT_ID" "POSTHOG_PROJECT_ID"
set_variable "POSTHOG_HOST" "POSTHOG_HOST"
set_variable "CLOUDFLARE_ACCOUNT_ID" "CLOUDFLARE_ACCOUNT_ID"
set_variable "VITE_EVENT_COLLECTOR_URL" "VITE_EVENT_COLLECTOR_URL"
set_variable "AGL_EVENT_COLLECTOR_EXPORT_URL" "AGL_EVENT_COLLECTOR_EXPORT_URL"
set_variable "AGL_EVENT_COLLECTOR_R2_BUCKET" "AGL_EVENT_COLLECTOR_R2_BUCKET"
set_variable "AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS" "AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS"
set_variable "VITE_ADSENSE_CLIENT_ID" "VITE_ADSENSE_CLIENT_ID"
set_variable "VITE_ADSENSE_REWARDED_SLOT_ID" "VITE_ADSENSE_REWARDED_SLOT_ID"
set_variable "ADMOB_PUBLISHER_ID" "ADMOB_PUBLISHER_ID"
set_variable "AD_NETWORK_PROVIDER" "AD_NETWORK_PROVIDER"
set_variable "AGL_ANDROID_PACKAGE_NAME" "AGL_ANDROID_PACKAGE_NAME"
set_variable "AGL_ANDROID_SHA256_CERT_FINGERPRINT" "AGL_ANDROID_SHA256_CERT_FINGERPRINT"
set_variable "AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED" "AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED"
set_variable "AGL_APPLE_DEVELOPER_ACCOUNT_CONNECTED" "AGL_APPLE_DEVELOPER_ACCOUNT_CONNECTED"
set_variable "AGL_AUTONOMOUS_SELF_UPDATE" "AGL_AUTONOMOUS_SELF_UPDATE"
set_variable "AGL_AUTONOMOUS_SELF_UPDATE_DIRECT" "AGL_AUTONOMOUS_SELF_UPDATE_DIRECT"
set_secret "CLOUDFLARE_API_TOKEN" "CLOUDFLARE_API_TOKEN"
set_secret "VITE_EVENT_COLLECTOR_WRITE_TOKEN" "VITE_EVENT_COLLECTOR_WRITE_TOKEN"
set_secret "AGL_EVENT_COLLECTOR_ADMIN_TOKEN" "AGL_EVENT_COLLECTOR_ADMIN_TOKEN"
set_secret "POSTHOG_PERSONAL_API_KEY" "POSTHOG_PERSONAL_API_KEY"
set_secret "AGL_ANDROID_KEYSTORE_BASE64" "AGL_ANDROID_KEYSTORE_BASE64"
set_secret "AGL_ANDROID_KEYSTORE_PASSWORD" "AGL_ANDROID_KEYSTORE_PASSWORD"
set_secret "AGL_ANDROID_KEY_ALIAS" "AGL_ANDROID_KEY_ALIAS"
set_secret "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON" "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON"

echo "Production GitHub variables/secrets sync complete for configured values."

sync_pages_settings

if [[ "${RUN_WORKFLOWS:-0}" == "1" ]]; then
  gh workflow run web-pwa-deploy.yml "${repo_args[@]}"

  if all_present CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_API_TOKEN AGL_EVENT_COLLECTOR_R2_BUCKET AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS VITE_EVENT_COLLECTOR_URL AGL_EVENT_COLLECTOR_EXPORT_URL VITE_EVENT_COLLECTOR_WRITE_TOKEN AGL_EVENT_COLLECTOR_ADMIN_TOKEN; then
    gh workflow run event-collector-deploy.yml "${repo_args[@]}"
  else
    echo "skip event collector workflow: collector variables/secrets are incomplete"
  fi

  if [[ "${ALLOW_ANDROID_RELEASE_WORKFLOW:-0}" == "1" ]] && all_present AGL_PUBLIC_ORIGIN AGL_ANDROID_SHA256_CERT_FINGERPRINT AGL_ANDROID_KEYSTORE_BASE64 AGL_ANDROID_KEYSTORE_PASSWORD AGL_ANDROID_KEY_ALIAS GOOGLE_PLAY_SERVICE_ACCOUNT_JSON; then
    gh workflow run android-twa-release.yml "${repo_args[@]}"
  else
    echo "skip Android workflow: held unless ALLOW_ANDROID_RELEASE_WORKFLOW=1 and signing/Play secrets are complete"
  fi
fi
