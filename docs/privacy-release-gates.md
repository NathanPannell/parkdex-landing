# Privacy page publication gates

The public routes are additive to the approved landing. They must not advertise a browser deletion action against a deployed app that does not implement it.

| Fact or behavior | Owner | Current evidence |
| --- | --- | --- |
| Support/privacy mailbox and fallback owner | User, via coordinator | Confirmed contact@nathanpannell.com; Nathan handles account access and deletion fallback. No response deadline or legal entity inferred. |
| Public app identity | Portfolio source | Nathan Pannell, Parkdex. No company registration claim. |
| External request path | Landing + app owner | App owner confirmed email request to Nathan must remain primary until the browser route is deployed and verified. No separate request database or unowned form. |
| Browser deletion intent | App owner | Proposed /?view=account&action=delete-account. Sign in, review, explicit confirmation; opening the URL never deletes an account. Pending implementation/deployed proof. |
| Account and related data deletion | App owner | Pending branch feat/account-deletion-beta, stacked on PR115. Source and isolated verification needed before claiming completed automation. |
| Photo cleanup | App owner | Proposed collect keys before cascade; immediate object deletion, durable pending intents if storage fails; existing manual recovery. No new poller or deadline. |
| Manual fallback fulfillment | App owner + Nathan | App owner committed a Nathan-owned runbook/tool with the same transactional cascade/photo outbox guarantees and existing manual cleanup. Confirm ownership before deleting; never ask for passwords. Implementation proof still required. |
| Waitlist | Landing source/live QA | Separate normalized email + created_at. Removal deletes current row, independent of app account deletion. |
| Provider retention | Release owner + delivery research | Landing restore-history setting24h, app Neon damp-hat-81652631 setting6h, Vercel Hobby visible runtime logs1h. These are not erasure deadlines. Railway/R2 metadata and provider-internal retention remain to reconcile. |

Before publish: finish source inventory, validate claims against deletion code/runbook, remove draft labels only when accurate, browser-test public navigation and deletion entry on a deployed URL, and retain evidence. Do not publish a dead automated deletion button simply because its route is agreed.

Independent static review found no broken local links or markup accessibility blocker. It flagged beta availability and deletion outcomes as publication gates. Copy now identifies a test version being prepared for Android and confirmed staging R2 and unverified production readiness, without asserting a published beta. Footer links must not be deployed while the target routes remain factual drafts; noindex is not an access control.

The Google Play guidance used for scope is https://support.google.com/googleplay/android-developer/answer/13327111?hl=en. This implementation does not claim legal certification or store approval.

Local UI verification completed on 2026-09-22: build passed; all three routes reviewed at 320/375/414/768/1440 pixels, with no horizontal overflow or material visual findings. Lower content, keyboard focus, footer links, retention anchor and waitlist disclosure navigation checked. Back and subsequent scrolling work. Draft screenshots are in `docs/evidence/privacy-support/`. This does not satisfy the pending deployed deletion/fulfillment or public URL checks.

Release result, 2026-09-22: app PR116 merged at `1b9b4b5da8ff428d493722047a182c331b9c87ce` and is live on `https://staging.parkdex.app` with frontend v1.0.066, API release `gha-35714038641-1`, and 18 migrations. The app owner verified the mobile Settings/deep-link confirmation path, clean browser console, and a disposable account's `DELETE /api/account` returning 200 with `photoCleanupPending: false`; the former bearer returned 401, an exact retry returned 200, and a different request ID returned 401. The owner-run `backend.app.account_delete` command calls the same `delete_account_rows` transaction and photo outbox service and requires an operator secret. Its documented support process requires independent ownership verification before running the command. The manual `python -m backend.app.photo_cleanup` command and pending-photo path are documented and covered by focused source tests. The staging proof did not physically delete an R2 object, so do not describe that provider operation as field-tested.

Landing deployment `dpl_9pYCt7vD1DThEofQ6GJoNGrMg49e` from `0417b7b` is READY on `https://parkdex-landing.vercel.app`. Chrome deployed QA confirmed all three public routes, email request links, `/privacy/#retention-title`, footer links, `/#email-privacy` expansion, Back then scroll, and responsive width checks with no horizontal overflow. A disposable absent waitlist address returned the generic removal success response and a dedicated Neon read found zero rows. After screenshots are in `docs/evidence/privacy-support/`.

