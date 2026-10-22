# Parkdex app motion clips for the landing page

Recorded 2026-10-22 from `NathanPannell/parkdex` at `origin/main` **7d2eba3** (#233), with the same build, local data and accounts as the stills in `../` (see that README for the stack, seed and flags). `leaderboard.webp` is older: recorded 2026-10-16 at `ba11e311` (#215).

- **Clips:** animated WebP, 540x1170, looping forever, sampled at 11 fps, holding the last frame about 1 s. Each is under 1 MB: quality 70 for hold and walk, 67 for go, 66 for founder and 62 for take.
- **Interactions:** the plant, take and visit are real taps in the app. The local database was re-seeded before each recording.
- **Recording:** Playwright with Chromium, a 390x844 phone viewport at device scale 2, an Android user agent and touch.

## Files

| File | What it shows | Duration | Size | Alt text |
| --- | --- | --- | --- | --- |
| `go.webp` | The "Welcome to Holland Point" arrival card, a tap on "Plant your flag", the flag slamming into the mound, points counting to +6, then "Flag planted" with "Park photo · +24" and "Back to map". | 6.9 s | 990 KB | Arriving at Holland Point, the player taps "Plant your flag". Their flag goes up and the screen says "Flag planted, +6 points". |
| `hold.webp` | A tap on the score chip on the map opens My Dex › Your flags: the score counts up to 684 and the four held parks appear. | 4.0 s | 629 KB | Tapping the score chip opens Your flags: @fern_finn, 4 parks held, 684 points. Clover Point Park 12d, Beacon Hill Park 7d, Cecelia Ravine Park 5d, Summit Park 3d. |
| `take.webp` | "Welcome to Moss Rocks" ("@salish_sky's flag has flown here for 9 days"), a tap on "Take it from @salish_sky", the rival's flag knocked out, @fern_finn's flag lands, +13, "You took Moss Rocks from @salish_sky". | 6.9 s | 984 KB | The player taps "Take it from @salish_sky". The rival's flag is knocked off Moss Rocks and their own flag lands: "You took Moss Rocks from @salish_sky", +13 points. |
| `founder.webp` | The Holland Point page opens, a tap on "Become the founder +24", the scan ("Checking you're inside Holland Point Park…"), then the outline highlighted with "You're in Holland Point Park" and "Take the photo". | 6.0 s | 950 KB | From the park page, "Become the founder, +24" opens the founding flow. It scans, highlights Holland Point Park's outline and offers "Take the photo". |
| `walk.webp` | Clover Point's page, a tap on "Visit your flag", then "Your flag is still flying", +1 point, "Clover Point is still yours." | 6.2 s | 540 KB | At Clover Point, held for 12 days, the player taps "Visit your flag": "Your flag is still flying", +1 point. |
| `leaderboard.webp` | (2026-10-16) A tap on Leaders: the podium rises and the ranked list slides in, then the Friends tab and back to Everyone. | 6.0 s | 875 KB | Leaderboard. Everyone: @salish_sky 842, @island_ivy 710, @fern_finn 690, then @cedar_kai 523, @gorge_runner 512, @wren_walks 283. Friends tab: parks this week, @fern_finn (you) first with 2. |
