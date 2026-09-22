# Parkdex privacy data inventory

Research checkpoint: 2026-09-21. This is a source inventory for the public
privacy page. It records observed behavior and separates the production
reference from staging and pending branches. It does not establish provider
contract terms or a legal retention promise.

## Source and release status

- The production reference `origin/main` is `ae5a30c`. It contains account,
  password, email, Google OAuth, groups, Wishlist, and MCP code. It does not
  contain the location-claim or private-photo files listed below.
- `origin/staging` is `8f2fd7f`, the merge of PR113. It contains the earlier
  live-location claim and private-photo backend from PR107. PR113 changes the
  staging UI and does not add a new data category.
- The latest app candidate is `parkdex-field-guide`, branch
  `feat/field-guide-my-dex`, local HEAD `acd2a0a`. It includes staging PR113,
  the Sealed Impressions PR114 candidate (`81dd426`), and the Field Guide,
  Collections, and My Dex PR115 candidate (`bd02d6d`). The task ledger records
  PR115 as a draft and says no production or domain change was made
  (`C:/repo/parkdex-workspace/.codex/task-ledgers/parkdex-app-evolution.md:107-124`).
- `parkdex-account-deletion`, branch `feat/account-deletion-beta`, is based at
  `bd02d6d` and has uncommitted deletion work. Treat that work as pending. The
  current committed API exposes `DELETE /api/account/progress` for a progress
  reset (`parkdex-field-guide/backend/app/main.py:1936-1970`); no committed
  `DELETE /api/account` route was found.

## Data categories and observed processing

| Category | Current behavior and storage | Evidence |
| --- | --- | --- |
| Account identity | An account has a normalized email address, account ID, password hash, email-verification state, created time, sessions, and optional Google identity. Passwords use Argon2id. | `parkdex-field-guide/backend/AUTH.md:3-5,9-18,20-27`; `parkdex-field-guide/database/migrations/0006_create_accounts_and_trail_completions.sql:1-30`; `parkdex-field-guide/database/migrations/0008_secure_account_authentication.sql:1-26` |
| Sessions and auth tokens | Login returns an opaque bearer token. The server stores only its SHA-256 digest. Sessions expire after 30 days; logout revokes the current session and password reset revokes all sessions. Password-reset and verification action tokens are hashed, one-use, and expire after one hour. | `parkdex-field-guide/backend/app/auth.py:13-26,54-89,176-212`; `parkdex-field-guide/backend/app/main.py:1736-1788` |
| Email delivery | Registration, password reset, and verification can send email. The source supports Resend or SMTP, and the read-only provider metadata reports `EMAIL_PROVIDER=resend` in staging and production. Delivery failures log an exception type and record a hashed recipient scope without a token. | `parkdex-field-guide/backend/AUTH.md:16-18`; `parkdex-field-guide/docs/account-email.md:5-12`; `parkdex-field-guide/backend/app/main.py:538-548`; `C:/repo/parkdex-workspace/output/parkdex-play-release-prep-20260922/PROVIDER-RETENTION.md:17-22` |
| Google sign-in | Google OIDC uses PKCE, a hashed single-use state and nonce, issuer/audience/signature/expiry checks, and Google's stable `sub`. The state expires after 10 minutes. Google-only accounts can be linked to a password account under the documented Gmail rules. | `parkdex-field-guide/backend/AUTH.md:20-27`; `parkdex-field-guide/backend/app/main.py:1827-1933`; `parkdex-field-guide/database/migrations/0008_secure_account_authentication.sql:18-36` |
| Local credentials and journal | Browser persistent credentials use browser storage; Android credentials use the native SecureCredentials plugin. Account and guest journals, outboxes, and retry metadata use browser IndexedDB or native app-private storage. | `parkdex-field-guide/frontend/lib/platform-storage.ts:15-121`; `parkdex-field-guide/frontend/components/native-runtime.tsx:20-39,74-100`; `parkdex-field-guide/frontend/lib/photo-retry.ts:282-440` |
| Visits and progress | An account has one saved visit per place, visit time, completed trails, badges derived from progress, private groups, and a protected Wishlist group. Guest progress uses a hashed collection key and can be imported into an account. The candidate documentation says there is no repeat-visit history or account-free cloud sync. | `parkdex-field-guide/docs/field-guide-my-dex.md:3-17`; `parkdex-field-guide/database/migrations/0003_create_places_and_visits.sql:19-26`; `parkdex-field-guide/database/migrations/0006_create_accounts_and_trail_completions.sql:10-44`; `parkdex-field-guide/database/migrations/0011_create_account_groups.sql:1-28` |
| Wishlist and collections | Groups and Wishlist are account-owned place memberships. MCP and REST operations read and mutate these records. | `parkdex-field-guide/docs/mcp.md:17-30`; `parkdex-field-guide/backend/app/groups.py:42-65,107-235`; `parkdex-field-guide/backend/app/main.py:720-972`; `parkdex-field-guide/database/migrations/0011_create_account_groups.sql:1-28` |
| Foreground location | The browser uses `navigator.geolocation`; Android uses Capacitor Geolocation. The live watcher is foreground-only and clears its fresh-claim state when the document or native app becomes inactive. A claim requires a recent precise sample. | `parkdex-field-guide/frontend/lib/native-capabilities.ts:172-220`; `parkdex-field-guide/frontend/lib/capacitor-native-capabilities.ts:223-291`; `parkdex-field-guide/frontend/lib/use-live-location.ts:29-91,133-185,295-340` |
| Location recommendation | An authenticated device sample is sent to `POST /api/claim-recommendations`. The server validates finite latitude and longitude, capture time, and accuracy no worse than 50 metres. The recommendation row stores account/session scope, capture time, latitude, longitude rounded to five decimals, accuracy, boundary version, match kind, distance, a token hash, and a 60-second expiry. Stale recommendations older than one hour are opportunistically deleted. | `parkdex-field-guide/docs/claims.md:3-17`; `parkdex-field-guide/backend/app/claims.py:177-215`; `parkdex-field-guide/backend/app/main.py:1130-1210`; `parkdex-field-guide/database/migrations/0015_create_location_claims.sql:1-48` |
| Claimed visit location | Creating a claim copies latitude, longitude, capture time, accuracy, boundary version, match kind, and distance into the account-scoped visit-claim row. The data is returned with that account's visit and remains with the visit until removal, progress reset, or account deletion. No automatic retention deadline for claimed location was found. Guest collection-key progress cannot create claim evidence. | `parkdex-field-guide/backend/app/main.py:1223-1300,150-190`; `parkdex-field-guide/backend/app/schemas.py:96-115`; `parkdex-field-guide/docs/claims.md:19-24` |
| Nearby search location | Nearby search accepts latitude, longitude, and radius as query inputs for distance sorting/filtering. The search query reads catalogue and visit state; no code path was found that writes those search coordinates to a user row. | `parkdex-field-guide/backend/app/main.py:662-699`; `parkdex-field-guide/backend/app/groups.py:250-306` |
| Visit photos | A photo is accepted only for an authenticated location claim. The API decodes it, applies EXIF orientation, rejects unsafe or animated inputs, scales to a 1,600-pixel long edge, strips metadata by JPEG re-encoding, and limits normalized output to 1 MB. The original, EXIF/IPTC/XMP fields, and GPS metadata are not retained. | `parkdex-field-guide/docs/claims.md:57-69`; `parkdex-field-guide/docs/photo-storage.md:13-21,38-45`; `parkdex-field-guide/backend/app/claim_photos.py:10-60` |
| Photo storage | The staging and candidate code stores the normalized JPEG in a private Cloudflare R2 bucket through the Railway API under a random `postcards/<nonce>.jpg` key. Neon stores the account-scoped object key, media type, dimensions, byte length, SHA-256 digest, and update time, never image bytes. Reads are authenticated and `private, no-store`; the API does not return an R2 URL. The allowlisted production service-variable response omitted R2 fields; inherited/effective configuration was not exhaustively checked. Production photo-storage readiness is unverified. | `parkdex-field-guide/docs/photo-storage.md:5-18`; `parkdex-field-guide/backend/app/object_storage.py:1-6,133-215`; `parkdex-field-guide/backend/app/main.py:1453-1628`; `C:/repo/parkdex-workspace/output/parkdex-play-release-prep-20260922/PROVIDER-RETENTION.md:20-28` |
| Device photo copies | Android camera capture requests `includeMetadata: false` and `saveToGallery: false`. The bounded recovery copy is account/place-scoped in app-private Filesystem storage. Browser retry uses same-origin IndexedDB when available. Copies are cleared after successful upload or account sign-out. | `parkdex-field-guide/frontend/lib/capacitor-native-capabilities.ts:294-333`; `parkdex-field-guide/frontend/lib/photo-retry.ts:4-14,43-49,282-440`; `parkdex-field-guide/docs/photo-storage.md:21` |
| Photo removal | Replacement and removal commit a durable object-deletion intent before the old object is touched, then attempt an idempotent delete. Failures remain in the outbox for the manual `python -m backend.app.photo_cleanup` command. There is no recurring cleanup service. | `parkdex-field-guide/docs/photo-storage.md:19,45`; `parkdex-field-guide/backend/app/main.py:283-469`; `parkdex-field-guide/backend/app/photo_cleanup.py:1-13`; `parkdex-field-guide/database/migrations/0016_add_visit_postcard_object_storage.sql:38-55` |
| MCP and OAuth | Hosted MCP is exposed through the Parkdex domain and proxied by Vercel to Railway. OAuth 2.1 authorization code plus PKCE gives an account-scoped `mcp` grant. It can search places and manage private groups/Wishlist; it cannot mutate visits, access collection keys, or use REST session endpoints. Access tokens last one hour, refresh tokens 30 days, authorization requests 10 minutes, and authorization codes 5 minutes. | `parkdex-field-guide/docs/mcp.md:3-30`; `parkdex-field-guide/backend/app/mcp_oauth.py:38-42,249-252,430-457,535-543`; `parkdex-field-guide/database/migrations/0012_create_mcp_oauth.sql:1-75` |

## Providers and network surfaces

- **Railway** runs the API and is the application boundary for account APIs,
  location claims, groups, MCP, email delivery calls, and photo reads/writes.
  **Neon PostgreSQL** stores account, auth, progress, groups, claim metadata,
  and photo metadata. The persistent topology is documented as Vercel to
  Railway to Neon (`parkdex-field-guide/ARCHITECTURE.md:5-13,17-24`).
- **Cloudflare R2** stores private normalized photo objects. The active bucket
  names, region, provider-side object lifecycle, backups, and access-log
  retention were not available from source and must be confirmed by the
  operator (`parkdex-field-guide/docs/photo-storage.md:5-9,25-36`).
- **Resend** receives account email content and recipient addresses in the
  configured staging and production environments according to the read-only
  provider metadata. Provider retention terms remain unknown.
- **Google** receives the OIDC authorization request and returns identity claims
  for Google sign-in. The source does not establish Google's retention terms.
- Map rendering loads **OpenFreeMap** glyph, relief, and vector tile URLs, uses
  the **OpenMapTiles** style, and attributes **OpenStreetMap contributors**.
  Evidence: `parkdex-field-guide/frontend/components/park-map.tsx:157-173` and
  `parkdex-field-guide/frontend/components/every-park-app.tsx:786`.
- **Capacitor Geolocation, Camera, Filesystem, Preferences, and the native
  SecureCredentials plugin** are device capabilities. Browser fallbacks use
  browser geolocation, local storage, and IndexedDB. These providers are used
  for device operation and local state, not as Parkdex server databases.

## Analytics, diagnostics, and logs

No Google Analytics, Plausible, PostHog, Segment, Sentry, Datadog, New Relic,
Rollbar, Bugsnag, Honeycomb, OpenTelemetry, or comparable first-party analytics
SDK or import was found in the candidate frontend source or package manifest.
Backend logging records operational exception types for email, storage, and
photo cleanup (`parkdex-field-guide/backend/app/main.py:248-280,538-548`).
Field diagnostics use a closed vocabulary, redact bearer tokens, URLs, email
addresses, coordinate pairs, and secret-like values, retain at most 20 entries
in memory, and expire entries after 6 or 12 seconds
(`parkdex-field-guide/frontend/lib/field-diagnostics.ts:25-47,116-137,242-436`).

Vercel, Railway, Neon, Cloudflare, Google, Resend, and map-tile provider access
or error logs are outside this application source. Their fields, IP handling,
and retention periods remain operator/provider facts to confirm.

## Retention and deletion observations

| Data or artifact | Observed lifetime or deletion behavior |
| --- | --- |
| Account session | 30 days, or earlier revocation by logout/password reset. |
| Password reset and email-verification action token | One use and one hour. |
| Google OAuth state | Single use and 10 minutes. |
| Claim recommendation | 60 seconds; expired rows older than one hour are cleaned during recommendation work. |
| MCP request, code, access token, refresh token | 10 minutes, 5 minutes, 1 hour, and 30 days respectively. Inactive MCP client rows are eligible for cleanup after 90 days. |
| Claimed location, visits, trails, groups, Wishlist, account row | No application retention deadline found. Progress reset removes progress and recreates an empty Wishlist, while leaving the account and authentication identity. |
| Private photo object | Delete is attempted immediately after the metadata tombstone commits. A storage failure remains in the durable outbox for manual cleanup. No deadline for failed-object completion is documented. |
| Provider backups, platform logs, and Neon/R2 internal copies | Read-only app-provider metadata reports Neon history `6 hours`, Railway Hobby observability `7 days`, Railway audit metadata `2 days`, and `AccessDenied` when reading the staging R2 lifecycle. These are provider settings or access limits, not erasure deadlines. The service-only production variable response omitted R2 settings; effective/inherited production configuration was not exhaustively checked, so readiness is unverified. The separate landing project records a Neon history setting of `24 hours`; that is also not an erasure deadline (`C:/repo/parkdex-workspace/output/parkdex-play-release-prep-20260922/PROVIDER-RETENTION.md:7-28`; `parkdex-landing/docs/landing-provider-retention.md:3-11`). |

## Account deletion status

The current shipped/reference source has sign-out and progress reset. It has no
account deletion route. The pending beta working tree proposes a bearer-auth
`DELETE /api/account` request with an idempotency request ID, explicit delete
confirmation, collection of all photo object keys into the existing outbox
before the account cascade, immediate object-delete attempts, and manual
cleanup for storage failures. The local owner retry marker is intended to be
cleared after server confirmation.

The pending implementation evidence is uncommitted:

- `parkdex-account-deletion/backend/app/account_deletion.py:1-6,127-180` contains
  the shared cascade/outbox primitive and a 24-hour idempotency receipt.
- `parkdex-account-deletion/database/migrations/0020_create_account_deletion_receipts.sql:1-16`
  defines that short-lived, non-PII receipt. Its 24-hour lifetime is an
  idempotency detail, not a deletion deadline for account data.
- `parkdex-account-deletion/frontend/lib/use-field-journal.ts:508-520,1145-1208`
  stores a request ID, retries the same server operation, and clears local state
  after confirmation when local storage permits.
- The current working tree has a potential UI/API integration difference to
  verify before release. The UI may translate its short confirmation phrase,
  but the server/client literal is:
  `parkdex-account-deletion/backend/app/schemas.py:263-267` and
  `parkdex-account-deletion/frontend/lib/account.ts:138-145` use
  `DELETE_ACCOUNT`, while the pending dialog currently asks the user to type
  `DELETE` (`parkdex-account-deletion/frontend/components/account-deletion-dialog.tsx:8,124-140`).
  The server route is also not present in the inspected `main.py`.

No account deletion completion deadline, provider-backup deletion schedule,
or automated deletion worker was found. Public copy should keep the manual
fallback and timing language factual until the route, outbox runbook, and
deployed behavior are verified.

## Confirmed operator facts and remaining release gates

- The user confirmed `contact@nathanpannell.com` for Parkdex support/privacy
  and Nathan's ownership of account-access and deletion fallback requests.
  Nathan Pannell is the established public name. No legal entity, postal
  address, or response deadline was inferred.
- Read-only provider metadata confirms Resend in staging and production,
  R2 confirmed in staging (production readiness unverified), app Neon restore history6h, and Railway
  log-access plan windows7d/2d. R2 lifecycle access was denied and provider
  internal erase schedules are unverified. See the provider inventory for
  these limits; none is a full-copy erasure deadline.
- Confirm whether PR114 and PR115 are deployed anywhere beyond their candidate
  branches, and do not describe their photo/location UI as production until an
  exact deployed revision is verified.
- Confirm the account-deletion route, manual owner runbook, photo outbox
  recovery procedure, and any post-request completion target before publishing
  automated deletion wording.

