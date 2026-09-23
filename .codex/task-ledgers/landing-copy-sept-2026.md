# Landing copy and interactions, September 2026

## Scope

Revise the production landing page to the operator's five visible sections: hero, unified map, visit proof, Dex progress, and footer. Remove the saved places section. Add the park count breakdown and four category example interactions. Replace the Android visit preview images with the specified sealed-impressions after captures. Keep the two email inputs usable with placeholders, and collapse footer details and credits.

## Source of truth

- Operator copy in the current task, including exact visible wording.
- Parkdex tracked-place data for counts, category colors, examples, and descriptions.
- `parkdex/staging/docs/pr-evidence/sealed-impressions` after images.
- Existing `PRODUCT.md`, `DESIGN.md`, and `AGENTS.md`, subject to the operator's revision.

## Operator decisions

- Use the exact five-section copy from this task, with only the first Dex sentence.
- Use the 198 total, with four category counts that include islands.
- Keep the hero disclosure small and anchored. Make the four map disclosures small tooltips anchored inside the map section.
- Use only arrival-after and collection-after Android preview screens, and keep all device screens nonclickable.
- Give the visit section a sage background, distinct from the map section.
- Include device frame improvements from parkdex-landing issue #4, using the two source frames linked in portfolio-2026 issue #5.
- Use “Connect with the land” for the Dex heading. Put a blank line between the two supporting statements in the visit and Dex sections.
- The hero count starts at 000 and reaches 198 in one second. Use the handwritten font in warm white with a warm-white underline. The four breakdown counts animate over 0.3 seconds each time the tooltip opens.
- Center middle-section content within about 1440px on wide screens, tighten vertical space, and enlarge supporting copy.
- Capture the live desktop Field Guide map with all pins for both laptop previews. Add a live mobile List view with filters to the unified map section. Keep the River Otter badge in the Dex section; use a mobile map capture in the hero phone.
- Make the handwritten hero number heavier with a real solid underline and spacing before “parks”. Remove “only” from the hero lede. Link the beta action directly to https://web.parkdex.app/.
- Use a compact desktop footer row and native modal dialogs for About your email and Credits.
- Add a filled Join the waitlist link above all footer content, returning to the hero email field. Sign the footer “See you out there. -Nathan” and link Nathan to https://www.nathanpannell.com/.
- Show every story device at one height on desktop. Hide the map and Dex laptops on phone widths and keep the four story phones at one size.

## Work

- [x] Read current landing implementation, project instructions, and design context.
- [x] Verify data and images.
- [x] Implement copy, disclosure interactions, assets, and responsive styling.
- [x] Replace device frame assets and verify no screen clipping.
- [x] Update project context for the new composition.
- [x] Build, test, inspect desktop and mobile in Chrome, and verify staging and production deployments.
- [x] Capture live desktop map and mobile list from the app.
- [x] Add the mobile list to section two, reuse the map for both laptops, and convert footer disclosures to dialogs.

## Notes

The existing Git worktree began clean on `main`.

Preview deployment `dpl_C4j54BqLJF79tt5cMCpHnXHVtqPJ` was built from this worktree and reached READY at `https://parkdex-landing-l7yzpz9fk-nathanpannells-projects.vercel.app/`. Chrome verified the category tooltips, equal-height desktop devices, mobile laptop removal, and email dialog. Promotion rebuilt the preview for Production as `dpl_2hqgjXpAsRj42jJuFYZD3EuGtomd`, serving `https://parkdex.app/` and `https://parkdex-landing.vercel.app/`. A disposable live signup and uppercase opt-out succeeded; the dedicated Neon read found zero remaining rows.

The footer CTA and linked Nathan signature are staged in Preview `dpl_B8SFWEqGeqjmsY56FVNM2oNc2pdr` at `https://parkdex-landing-i1zm4ndpl-nathanpannells-projects.vercel.app/`. Its button sits above every other footer item, links to `#email`, and focuses the hero email field at phone width. Chrome checked the 1440px and 320px layouts. Production remains on the previous deployment, per operator request.
