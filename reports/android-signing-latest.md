# Android Signing

Generated: 2026-05-22T02:06:11.883Z
Status: signing-prepared
Package: app.autonomousgamelab.portal
Fingerprint: FC:92:04:44:5B:93:78:92:A9:8C:08:50:BF:97:7A:90:A5:62:61:81:53:E7:A9:AA:A9:39:86:74:AE:D3:52:C2

## Local Files

- Keystore: ops/android/signing/release.keystore (present)
- Local env: ops/production.env.local (synced)
- Git ignored: true

## Checks

- pass: signing-tool - keytool is available for Android signing material.
- pass: keystore-file - Local keystore exists at ops/android/signing/release.keystore.
- pass: fingerprint - SHA-256 fingerprint is available for Digital Asset Links.
- pass: local-env-sync - Signing values were synced into ops/production.env.local with secret values redacted from reports.
- pass: secret-redaction - Keystore bytes, base64, and password are never written to committed reports or src/data artifacts.

## Guardrails

- zeroPaidSpend: true
- noAccountCreation: true
- noStoreSubmission: true
- noRevenueEnablement: true
- noSecretValuesInReports: true
- localSecretFilesGitIgnored: true
- doesNotCommitKeystore: true
- doesNotRotateExistingFingerprintInCi: true

## Blockers

- none
