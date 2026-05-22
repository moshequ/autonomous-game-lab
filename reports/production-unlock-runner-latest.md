# Production Unlock Runner

Generated: 2026-05-22T22:32:56.722Z
Status: unlock-runner-idle
Mode: execute-unlocked-local-followups
Handoff: handoff-waiting-on-owner-inputs
Source hash: c58b28cbf2a8

## Summary

- Runnable unlocks: 0
- Queued commands: 0
- Blocked unsafe unlocks: 0
- Completed fingerprints: 0

## Unlock Plans

- held: support-contact - web-support-ready-store-email-deferred; commands 4; Held because handoff status is web-support-ready-store-email-deferred.
- held: production-analytics-browser - owner-input-required; commands 6; Held because handoff status is owner-input-required.
- held: autonomous-rollup-credentials - owner-input-required; commands 3; Held because handoff status is owner-input-required.
- held: product-gate-sample - needs-live-sample; commands 4; Held because handoff status is needs-live-sample.
- held: ad-provider-config - blocked-by-product-gates; commands 2; Held because handoff status is blocked-by-product-gates.
- held: google-play-account - owner-account-required; commands 2; Held because handoff status is owner-account-required.
- held: google-play-service-account - blocked-by-play-account; commands 1; Held because handoff status is blocked-by-play-account.
- held: apple-developer-account - deferred-until-ios-payback; commands 2; Held because handoff status is deferred-until-ios-payback.

## Command Queue

- none

## Execution

- Requested: true
- Status: idle
- Attempted commands: 0

## Controls

- zeroPaidSpend: true
- noAccountCreation: true
- noStoreSubmission: true
- noRevenueEnablement: true
- noPaidAcquisition: true
- noExternalPosting: true
- noWorkflowDispatch: true
- noSecretValuesStored: true
- dryRunByDefault: true
- staticCommandAllowlist: true
- executesOnlyConfiguredOrClearHandoffs: true
- commandFailuresStopRun: true
