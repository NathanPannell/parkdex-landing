# Public privacy, deletion and support

Started 2026-09-21. Explicit user-authorized beta scope delegated by appointed coordinator01a0c60f. No main app release or domain migration authorized. Landing deployment to existing temporary Vercel project allowed after factual verification.

## Ownership
- Root: privacy page, footer/build integration, factual reconciliation, deployed QA and release.
- privacy_inventory (Luna): read-only app data/provider/retention source inventory.
- support_routes (Luna): additive support/deletion route shells and shared typography/styles. No unowned submission form.
- App task01a0c5bc: actual authenticated account/data/photo/local-state deletion and browser route contract.
- Release task01a0c5fb: Play listing/Data safety preparation; receive verified public URLs.

## Planned URLs
- https://parkdex-landing.vercel.app/privacy
- https://parkdex-landing.vercel.app/delete-account
- https://parkdex-landing.vercel.app/support

All draft and unpublished at start. Approved landing composition preserved; additive footer links only.

## Required facts
- Exact operator/privacy/support contact and operational ownership. Existing noscript uses contact@nathanpannell.com, verification underway.
- Actual current/pending data inventory: accounts/auth, location, visits, photos, storage, integrations, diagnostics.
- Browser deletion route, identity verification, dependent data/storage/local cleanup and exceptional failure handling.
- Configured backup/log retention and operational cleanup expectations, without invented deadlines.

## External requirements consulted
Google's official account deletion guidance requires an accessible, app-named external pathway that allows a deletion request without reinstalling the app. Sign-in/browser deletion is acceptable if functional. Associated data and any retention must be explained. This is a product policy draft, not a legal-compliance certification.
Source: https://support.google.com/googleplay/android-developer/answer/13327111?hl=en

## Design
Continue established paper/ink typography in Read/Operate mode. No new visual identity, hero changes or speculative features. Shared route navigation and clear action hierarchy. Existing Impeccable context already loaded in this session; new-work and craft-floor read before additive UI changes.

## Source draft checkpoint, 2026-09-21
- All three additive routes now exist. Shared src/support.css/ts, footer links and /#email-privacy disclosure handling wired into source/build entries. Draft/noindex notices remain; nothing new deployed.
- Contact and Nathan's operational ownership confirmed by user through coordinator. Email is primary deletion entry. No guessed browser endpoint is exposed.
- App owner agrees same transaction/photo outbox service for manual fulfillment; source docs/account-deletion.md and backend/app/account_delete.py now exist in pending app branch. Exact tested staging release still required. Requested explicit ownership-verification steps in owner runbook.
- Data inventory complete: docs/privacy-data-inventory.md. Landing metadata in docs/landing-provider-retention.md; app metadata copied to docs/app-provider-retention.md. Resend bothenvs, R2confirmedinstagingwithproductionreadinessunverified, precise claim evidence retained, JPEG metadata removed separately. No invented provider-erasure timing.
- Independent static content/accessibility review assigned technical_audit. Support scaffolding and research agents finished. Root consolidated support CSS and shortened copy, omitting future browserflow technical slots and generic card scaffolding.
- Sealed owner reserved15-25min quiet window for114 Android gate. No root build/server/watcher/test/deploy running. Build and browser review wait window release; public functional deletion QA/publication also waits deletion followup stagingLIVE per coordinator.
- User authorized agreed staging sequence113(done),114,115,deletionfollowup,releaseconfig. Main app production/domain hold remains. Existing temporary independentlandingdeployallowedafterfacts/tests.


## Checkpoint correction
- Draft source pushed as75e32ac; no deployment triggered (Git auto-deploy disabled).
- Corrected over-inference from missing production service-only R2 fields: inherited/effective variables were not exhaustively inspected. Production photo-storage readiness is unverified, not established as unconfigured. All local inventory/draft wording corrected.
- OpenFreeMap policy read directly: anonymized logs retained indefinitely, incident IP logs up to30days, possible Cloudflare delivery. Public draft links that policy; no universal no-logs claim or inferred end-user age restriction.
- All completed subagents explicitly interrupted after handoff at coordinator/user request. Results retained; no active worker, build, server, watcher or deployment.
- Quiet window extended by114 owner for bounded native-gate diagnosis. Source/static review only so far. Build/browser QA and final publication remain pending the release gates.

## Local verification, 2026-09-22
- Quiet window released by PR114 owner and coordinator. `npm run build` passed, including TypeScript and all three static entries.
- One browser review batch at 320, 375, 414, 768 and 1440 pixels for all three routes. No horizontal overflow detected. Independent Sol visual review found no material first-viewport issues; root checked lower-page copy/footer at 320 pixels.
- Support to About your email opens the disclosure with removal controls. Footer to Delete account and retention anchor navigation work. Back preserves the disclosure; scrolling remains functional. Visible skip-link keyboard focus checked. No console errors or warnings in the QA tab.
- Evidence saved under docs/evidence/privacy-support/draft-*.jpg. These are local draft screenshots, not deployed verification. No support email was sent and no account was deleted during this check.
- Local preview session 15949 stopped. QA tab closed and temporary viewport reset. Visual reviewer interrupted after its report. No active server, watcher or worker remains.
- Publication still waits for deletion follow-up staging LIVE and verified manual fulfillment/photo cleanup. Final copy reconciliation, public URL browser QA and final footer PR evidence remain outstanding.

## Accelerated release, 2026-09-22
- User approved a one-hour staging and signed-Android-build target through the coordinator, with native emulator gate waived. Independent landing temporary Vercel publication is authorized after the app deletion follow-up is LIVE on staging and the manual fulfillment/photo cleanup contract is verified. App production, main domain, and Play upload remain outside this release.
- Final public copy prepared in source: draft notices/noindex removed, privacy dated September 22, 2026, provider wording states only the confirmed Android test version R2 behavior, and deletion text promises no full completion notice while photo cleanup is pending.
- This is source preparation only. No new public deployment until the owner sends exact staging live URL/commit and verified deletion/manual cleanup outcome. Existing local responsive QA applies to layout; deployed Chrome QA is required after release.
