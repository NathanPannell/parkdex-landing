# Parkdex landing

## Scope
Build and deliver an independent one-screen landing application with real device screenshots and durable Android waitlist registration. New Vercel project and temporary URL only. Future main domain migration is outside this task.

## Ownership
Root owns design, implementation integration, final browser QA and delivery. Research was read-only. Delivery agent created the isolated Vercel project and Neon database documented in DEPLOYMENT.md. These resources are retained for the public landing page.

## Progress
- Read Hallmark and Impeccable. Inspected live www.nathanpannell.com and Parkdex product documentation.
- User confirmed Vercel only and temporary URL. Eventual app destination web.parkdex.app.
- Product context recorded. Separate sibling application at parkdex-landing.

## Delivered
- Independent Vite application and Vercel signup Function, dedicated Neon storage, private GitHub repository.
- Portfolio-derived typography, paper, green ink, lime highlight, real app screenshots in matte phone/laptop frames, native screenshot viewer.
- Android email validation, durable normalized deduplicated storage, honeypot, origin checks, bounded request size, friendly failure/retry states, Vercel WAF rate limit.
- Deployed runtime revision 2bfa26b at https://parkdex-landing.vercel.app. Future domain migration remains outside this release.
- Six API contract tests and production typecheck/build passed. Live desktop and mobile signup verified against the database; synthetic records removed.
- Browser checks: invalid email, rate-limit feedback and retry, disabled success until edit, viewer switching, Escape/focus restoration, mobile viewer, app navigation, Back then Scroll, privacy disclosure.
- Responsive inspection across 320 to 1697 pixels. Independent finish review disposition SHIP after header/short-screen corrections. Cropped before/after evidence retained in docs/evidence.

## Final handoff
Commit design and deployment documentation, push feature branch, create and attach draft pull request. Keep the Vercel alias available for review.
