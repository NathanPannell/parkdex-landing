# Parkdex app screenshots for the landing page

Recaptured 2026-10-22 from `NathanPannell/parkdex` at `origin/main` **7d2eba3** (#233, which promoted #232: crews and personal photos retired, the park page rebuilt around one big button). `app-leaderboard.webp` is older: it was captured 2026-10-16 at `ba11e311` (#215) and shows nothing that has since changed.

All files are 780x1688 WebP (quality 88): a 390x844 phone viewport at device scale 2, no browser chrome.

## How they were made

- The app ran entirely on this machine: `npm run local:api -- --content` (the real API worker) against a throwaway loopback PostgreSQL 18 cluster (a `kip_qa_*` database), with the Vite dev server on `http://127.0.0.1:5190` proxying `/api` to it ([docs/local-stack.md](https://github.com/NathanPannell/parkdex/blob/main/docs/local-stack.md)). Parks came from the public staging catalogue, map tiles and park art from the public content CDN.
- Feature flags came from a local `kip_app_config.builds` row for web build 0: `friends` and `parkProposals` on, `crews` and **`badges` off**. No badge shelf, unlocks or patches appear.
- Signed in as the local seed account `tester1@example.test`, shown as `@fern_finn`. The other players (`salish_sky`, `island_ivy`, `cedar_kai`, `gorge_runner`, `wren_walks`, `lark_and_lu`, `oakbay_ollie`, `beacon_bea`) are fictional `@example.test` rows that exist only in that throwaway database.
- Game history was seeded with the app's own `kip_game.record_visit_with_badges` and backdated times, so flag ages and points come from the real rules: @fern_finn holds Clover Point (12 days), Beacon Hill (7), Cecelia Ravine (5) and Summit (3); @salish_sky has held Moss Rocks for 9 days; Holland Point is empty and has no founder. The history was re-seeded before each capture.
- The plant, take and visit were real taps in the app (one tap now starts them; there is no press-and-hold). The player's position was set through the app's saved last location. Kip's Tips were dismissed. The dev build's "Demo: teleport here" link, which hosted builds don't have, was hidden with injected CSS; nothing else was altered.
- Capture: Playwright driving Chromium, Android Chrome user agent, `isMobile`/`hasTouch`, geolocation granted, `America/Vancouver` time zone; converted to WebP with sharp.

## Files

The moving loops for the homepage screens are in `motion/`.

| File | Screen and state | Alt text |
| --- | --- | --- |
| `app-planted.webp` | Result right after planting at the empty Holland Point. Used in the hero. | Flag planted: your flag flying over Holland Point, with Kip cheering beside it. |
| `app-arrive.webp` | Arrival card inside an empty park, before planting. | "Welcome to Holland Point", Inside the boundary. "Nobody holds this park yet. Plant your flag and earn a point every hour it flies." Button: Plant your flag. Kip: "KLEEP! You made it!" |
| `app-your-parks.webp` | My Dex, Your flags tab: score card and the held parks with flag ages. | My Dex, Your flags. @fern_finn, 4 parks held, 684 points. Clover Point Park 12d (your longest-flying flag), Beacon Hill Park 7d, Cecelia Ravine Park 5d, Summit Park 3d. |
| `app-take.webp` | Mid-takeover at Moss Rocks: the rival's flag tips off as @fern_finn's comes in. | Take it from @salish_sky: the rival's flag tumbles off Moss Rocks while the player's flag comes in to replace it. |
| `app-founder.webp` | Holland Point Park page just after planting: "Your park", "Become the founder +24", no founder yet. | Holland Point Park, just planted: "Your park, your flag went up today." No founder yet. Button: Become the founder, +24. |
| `app-walk.webp` | Clover Point Park page, a park @fern_finn has held for 12 days, with the main button "Visit your flag". | Clover Point Park: "Your park, yours for 12 days." Button: Visit your flag. |
| `app-leaderboard.webp` | Leaders, Everyone tab: podium and ranked list (2026-10-16 capture). | Leaderboard, Everyone. 1 @salish_sky 840 pts, 2 @island_ivy 708 pts, 3 @fern_finn 686 pts; then @cedar_kai 521, @gorge_runner 511, @wren_walks 281, @lark_and_lu 209, @oakbay_ollie 179. |

## Notes

- The result screens' Kip cheer ("KLEEP! Flag's up! +6") is screen-reader only in this build; the screen shows the points count-up.
- Points reflect capture time (a flag earns 1 point per hour), so totals differ slightly between shots and from the older leaderboard.
