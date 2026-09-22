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

