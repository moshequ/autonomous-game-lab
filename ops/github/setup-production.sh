#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Authenticate GitHub CLI before syncing production settings." >&2
  exit 1
fi

repo="${GITHUB_REPOSITORY:-${GH_REPO:-}}"

derive_repository_name() {
  node -e 'const fs=require("fs"); let name="autonomous-game-lab"; try { name=JSON.parse(fs.readFileSync("package.json","utf8")).name || name } catch {} name=String(name).split("/").pop().replace(/[^A-Za-z0-9._-]+/g,"-").replace(/^-+|-+$/g,"") || "autonomous-game-lab"; console.log(name)'
}

if [[ -z "$repo" && "${AGL_ALLOW_GH_INFER_REPOSITORY:-1}" == "1" ]]; then
  gh_owner="$(gh api user --jq .login 2>/dev/null || true)"
  if [[ -n "$gh_owner" ]]; then
    repo="$gh_owner/$(derive_repository_name)"
    echo "inferred GitHub repository target: $repo"
  fi
fi

if [[ -z "$repo" ]]; then
  echo "Set GITHUB_REPOSITORY/GH_REPO or authenticate gh so owner/package-name can be inferred." >&2
  exit 1
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

if [[ "${RUN_WORKFLOWS:-0}" == "1" ]]; then
  gh workflow run web-pwa-deploy.yml "${repo_args[@]}"

  if all_present CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_API_TOKEN VITE_EVENT_COLLECTOR_URL AGL_EVENT_COLLECTOR_EXPORT_URL VITE_EVENT_COLLECTOR_WRITE_TOKEN AGL_EVENT_COLLECTOR_ADMIN_TOKEN; then
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
