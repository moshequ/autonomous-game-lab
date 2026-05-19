# Android TWA Handoff

Generated: 2026-05-18T23:36:59.702Z
Status: blocked-draft-ready

## Files

- `twa-manifest.json`: deterministic app metadata for the Android Trusted Web Activity build.
- `bubblewrap.config.json`: commands and resolved package/host/signing state.
- `assetlinks.template.json`: Digital Asset Links template for the production host.

## Commands

- Init: `npx @bubblewrap/cli init --manifest https://YOUR_HOST/manifest.webmanifest`
- Validate: `npx @bubblewrap/cli validate`
- Build: `npx @bubblewrap/cli build`

## Blockers

- Production host is missing or still uses example.com.
- Hosted privacy policy URL is missing.
- Android signing certificate SHA-256 fingerprint is missing.
- Google Play developer account is not connected.
