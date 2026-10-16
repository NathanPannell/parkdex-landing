# Parkdex app screenshots for the landing page

Captured 2026-10-16 from `NathanPannell/parkdex-kip` at `origin/staging` **ba11e311b0d248584641a6711db11817190a103f** ("Record the Nova Scotia production load (2026-10-14) (#215)").

All files are 780x1688 WebP (quality 88): a 390x844 phone viewport at device scale 2, no browser chrome.

## How they were made

- The app ran entirely on this machine: `npm run local:api` (the real API worker) against a throwaway loopback PostgreSQL 18 cluster (database `kip_qa_local`), with the Vite dev server on `http://127.0.0.1:5190` proxying `/api` to it. Parks came from the public staging catalogue snapshot, map tiles and park art from the public content CDN.
- Feature flags came from a local `kip_app_config.builds` row for web build 0: `crews` on, `friends` on, `parkProposals` on, **`badges` off**. No badge shelf, unlocks or patches appear in any shot.
- Signed in as the local seed account `tester1@example.test` (from `scripts/local-stack.seed.json`), with its handle changed to `fern_finn` in the local database. The other players (`oakbay_ollie` is seed account `tester2`; `salish_sky`, `island_ivy`, `cedar_kai`, `gorge_runner`, `wren_walks`, `lark_and_lu`, `beacon_bea` are extra `@example.test` rows) are fictional and exist only in that throwaway database.
- Game history was seeded with SQL by calling the app's own `kip_game.record_visit_with_badges` and `kip_game.join_crew_with_badges` with backdated times, so flag ages, points and the Beacon Hill crew (oakbay_ollie, fern_finn, lark_and_lu) are computed by the real rules.
- The plant and take were done in the app with a real hold-to-plant; the player's position was set through the app's saved last location (no demo-tools overlay). Kip's Tips were dismissed before each capture.
- Capture: Playwright (`playwright-core`) driving chrome-headless-shell, Android Chrome user agent, `isMobile`/`hasTouch`, geolocation granted, `America/Vancouver` time zone; converted to WebP with sharp.

## Files

`app-take.webp` (the take step's still) is a frame of the takeover animation; see `motion/README.md`. The moving loops for every homepage screen are in `motion/`.


| File | Screen and state | Alt text |
| --- | --- | --- |
| `app-flag-map.webp` | Explore map of Victoria, BC, signed in. Score chip, flag pins with age tags (3d, 5d, 7d, 9d, 10d, 12d, 21d), empty dashed pins, Beacon Hill's crew flag with pennants, the "Parks near you" cards and the bottom bar. | Parkdex map of Victoria with players' flags on parks. Score chip: 686 points, @fern_finn · 4 parks. Cards: Beacon Hill, Yours · 1.3 km; Holland Point, No flag · 1.6 km; Moss Rocks, @salish_sky · 2.1 km. |
| `app-leaderboard.webp` | Leaders, Everyone tab: podium and ranked list. | Leaderboard, Everyone. 1 @salish_sky 840 pts, 2 @island_ivy 708 pts, 3 @fern_finn 686 pts; then @cedar_kai 521, @gorge_runner 511, @wren_walks 281, @lark_and_lu 209, @oakbay_ollie 179. |
| `app-crew.webp` | Crew code sheet right after planting at Holland Point: QR code, 6-character code and the protected-hour countdown. | "Bring your crew" crew code for Holland Point: K4Z-D3P, 53 min left. "Anyone in the crew can show this code." Button: Share the link. |
| `app-founder.webp` | Holland Point Park sheet just after planting: your flag (protected, Show crew code), "No founder yet" and the "Become the founder +24" prompt. | Holland Point Park. Your flag, planted today, protected · 53 min. No founder yet. "Become the founder: Take its first photo. It becomes the park's cover." +24. |
| `app-your-parks.webp` | My Dex, Your flags tab: score card and the held parks with flag ages. | My Dex, Your flags. @fern_finn, 4 parks held, 686 points. Clover Point Park 12d (your longest-flying flag), Beacon Hill Park 7d, Cecelia Ravine Park 5d, Summit Park 3d. |
| `app-arrive.webp` | Arrival card inside an empty park, before planting. | "Welcome to Holland Point", Inside the boundary. "Nobody holds this park yet. Plant your flag and earn a point every hour it flies." Button: Plant your flag. Kip: "KLEEP! You made it!" |

## Notes

- The take result's per-part breakdown ("KLEEP! +4 for the take, +9 for those 9 days!") is screen-reader only in this build (`.plant__cheer` is visually hidden); the screen shows the +13 total.
- The founder celebration itself (after the photo check) cannot be reached locally: the photo check needs the OpenRouter decision API. The founder shot shows the prompt instead.
- Points and minutes reflect capture time (a flag earns 1 point per hour), so the numbers differ slightly between shots taken before and after the plant and take.
