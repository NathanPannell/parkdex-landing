# Landing design refinement and waitlist removal

## Scope
Review exact screenshot content, remove decorative device pileup, improve app story and implement direct email removal under About your email. Keep photo, brand, existing app links, separate Vercel deployment.

## Ownership
Root: UI composition, frontend behavior, browser review, delivery.
removal_api: API handler, adapter, meaningful tests.
design_audit: independent visual review.
technical_audit: independent technical review and final detector.

## Acceptance
Recognizable photo, CTA and phone before scroll at prescribed sizes. Screenshots preserve original content and show clearly at natural aspect ratio. Inline preview selection and full-size dialog keyboard controls work. Removal is idempotent, normalized and gives no membership disclosure. Live join then remove verified with owned synthetic record; no residual test data. Cropped before/after evidence in PR.

## Status
Implementation in progress. Prior build clean at start. Existing approved screenshot sources remain available.

## User steering
- User asked to see two rendered mockups before choosing a visual revision. Build unlinked public mockup routes; do not replace the main visual design until choice.
- Removal is independently authorized and ships under the existing disclosure. Mockup signup/removal forms are explicitly non-mutating previews.
- User asked for researched Figma-style real device frames after mockup revision; research delegated, do not hand draw notch/buttons. Whole screenshot must remain visible.

## Removal decisions
- Same-page signup/removal are serialized. Both return generic responses and share the existing POST WAF rule.
- Frictionless opt-out removes only the submitted normalized address, without revealing membership. It intentionally does not require inbox verification; no transactional email service or account is introduced for this low-risk launch list.
