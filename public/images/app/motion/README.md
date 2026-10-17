# Parkdex app motion clips for the landing page

Recorded 2026-10-16 from `NathanPannell/parkdex-kip` at `origin/staging` **ba11e311b0d248584641a6711db11817190a103f** (#215). This is the same build, local data and accounts as the stills in `../app/`.

- **Clips:** animated WebP, 540x1170, looping forever (`loop: 0`). The first frame of each loop is captured from about the tenth of a second before the interaction starts. The last frame holds about 1 s before the loop restarts.
- **Frame rate:** the frames are sampled at 11 fps. Frames that did not change are merged into one longer frame, so the effective average is 7.5 to 9.5 fps.
- **Stills:** each clip has a `*-still.webp` at 780x1688 (WebP quality 88), taken from the full-resolution capture.

## How they were made

- **Stack:** everything ran locally. `npm run local:api` served the real API against a throwaway loopback PostgreSQL 18 database (`kip_qa_local`), and the Vite dev server ran on `http://127.0.0.1:5190`. Parks came from the public staging catalogue, and map tiles and park art from the public content CDN.
- **Feature flags:** web build 0 had `crews`, `friends` and `parkProposals` on and **`badges` off**.
- **Account:** signed in as the local seed account `tester1@example.test`, shown as `@fern_finn`. Every other player is a fictional `@example.test` row that exists only in that database.
- **Friends tab:** for the Friends tab in `leaderboard.webp`, `@fern_finn` was made friends with oakbay_ollie, lark_and_lu, cedar_kai and beacon_bea in the local database.
- **Interactions:** the plant and the take are real presses and holds in the app. After each recording, the local database was reset to the state of the stills.
- **No overlays:** no demo overlays, toasts or Kip's Tips appear. Tips were dismissed before each recording started.
- **Recording:** Playwright with chrome-headless-shell on GPU (ANGLE D3D11), a 390x844 phone viewport at device scale 2, an Android user agent and touch. Frames were grabbed with a CDP `Page.captureScreenshot` loop at about 16 to 25 fps.
- **Why not screencast:** CDP screencast frames came out at the wrong size after the app's fullscreen request. The capture harness stubbed `requestFullscreen` so the viewport stays at 390x844.
- **Hero clip:** removed; the hero now shows the still `app-planted.webp`.
- **Assembly:** frames were resized with Lanczos and encoded with Pillow's libwebp (quality 70, 60 for the hero, keyframes every 4 to 5 frames). Inter-frame encoding keeps the dark plant scenes free of blocking.

## Files

| File | What it shows | Duration | fps | Size | Alt text |
| --- | --- | --- | --- | --- | --- |
| `hero-still.webp` | The wide end frame | – | – | 155 KB | Same as above. |
| `go.webp` | At the empty Holland Point: the "Welcome to Holland Point" arrival card, a tap on "Plant your flag", the press-and-hold ring filling, the flag slamming into the mound with dirt and confetti, the points counting up to +6 and "Flag planted". | 6.9 s | 11 | 883 KB | Arriving at Holland Point, the player presses and holds "Plant your flag". Their flag goes up and the screen says "Flag planted, +6 points". |
| `go-still.webp` | The "Flag planted +6" result | – | – | 68 KB | "Flag planted", +6 points. "Your flag is flying over Holland Point." |
| `hold.webp` | A tap on the score chip on the map opens My Dex > Your flags. The score card counts up to 690 points and the held parks slide in with their flag ages. | 3.8 s | 11 | 502 KB | Tapping the score chip opens Your flags: @fern_finn, 4 parks held, 690 points. Clover Point Park 12d, Beacon Hill Park 7d, Cecelia Ravine Park 5d, Summit Park 3d. |
| `hold-still.webp` | The Your flags screen | – | – | 72 KB | Same as above. |
| `take.webp` | **The takeover.** At Moss Rocks, "Take it from @salish_sky" with the hold ring filling. @salish_sky's flag is knocked out and spins away, @fern_finn's flag slams in, the points count to +13, and "You took Moss Rocks from @salish_sky" appears. | 6.7 s | 11 | 977 KB | The player holds "Take it from @salish_sky". The rival's flag is knocked off Moss Rocks and their own flag lands: "You took Moss Rocks from @salish_sky", +13 points. |
| `take-still.webp` | Mid-takeover: @salish_sky's flag flying off the mound as @fern_finn's flag comes down | – | – | 42 KB | Take it from @salish_sky: the rival's flag tumbles off Moss Rocks while the player's flag comes down to replace it. |
| `crew.webp` | A tap on the just-planted Holland Point park card opens the sheet: "Your flag · Planted today · protected 57 min · Just you so far". A tap on "Show crew code" slides up the crew code sheet with its QR code, code and countdown. | 4.9 s | 11 | 621 KB | Opening Holland Point and tapping "Show crew code": "Bring your crew", QR code, code C26-PYX, 57 min left. |
| `crew-still.webp` | The crew code sheet | – | – | 69 KB | "Bring your crew", crew code C26-PYX for Holland Point, 57 min left, Share the link. |
| `founder.webp` | The Holland Point sheet scrolls to "No founder yet" and "Become the founder +24". A tap starts the founding flow: a radar scan ("Checking you're inside Holland Point Park…"), then the park outline is highlighted with "You're in Holland Point Park" and "Take the photo". | 6.0 s | 11 | 902 KB | From the park sheet, "Become the founder, +24" opens the founding flow. It scans, highlights Holland Point Park's outline and offers "Take the photo". |
| `founder-still.webp` | The outline highlighted, ready for the photo | – | – | 81 KB | Become the founder: "Take its photo to be the founder." You're in Holland Point Park. Button: Take the photo. |
| `leaderboard.webp` | A tap on Leaders: the podium rises (1 @salish_sky 842, 2 @island_ivy 710, 3 @fern_finn 690) and the ranked list slides in. Then Friends (parks this week: @fern_finn (you) 2, @beacon_bea, @cedar_kai, @lark_and_lu, @oakbay_ollie 1 each) and back to Everyone. | 6.0 s | 11 | 875 KB | Leaderboard. Everyone: @salish_sky 842, @island_ivy 710, @fern_finn 690, then @cedar_kai 523, @gorge_runner 512, @wren_walks 283. Friends tab: parks this week, @fern_finn (you) first with 2. |
| `leaderboard-still.webp` | The Everyone board | – | – | 82 KB | Leaderboard, Everyone: 1 @salish_sky 842 pts, 2 @island_ivy 710 pts, 3 @fern_finn 690 pts; @cedar_kai 523, @gorge_runner 512, @wren_walks 283, @lark_and_lu 212, @oakbay_ollie 180. |

## Notes

- Points tick up by the hour, so they are slightly higher than in `../app/` (690 rather than 686).
- `go.webp` and `take.webp` run about 6.7 to 6.9 s, a little over the 6 s target. The hold itself takes 1.1 s and the result headline lands about 4 s after release, so cutting them shorter would drop the arrival or the result.
- The take's per-part breakdown ("+4 for the take, +9 for those 9 days") is screen-reader only in this build, so the clip shows the +13 count-up.
- The crew-join pennant raise needs a second signed-in device inside the park within the protected hour, so it was not recorded. `crew.webp` shows the crew code sheet instead.
