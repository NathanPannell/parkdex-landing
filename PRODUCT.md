# Parkdex landing

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Delegated. A standalone static web application with one Vercel serverless signup endpoint. Deploy to a new Vercel project and temporary URL. No Cloudflare deployment.

## Users
People exploring Vancouver Island and nearby islands who want to discover parks and keep a record of visits.

## Product Purpose
Introduce the Parkdex flag game: go to a real park, plant your flag, earn a point every hour it flies, take parks from other players, hold them as a crew and found new ones. Send Android visitors through the self-service beta (Parkdex Testers Google Group, then Google Play testing opt-in and install), register email addresses for the App Store waitlist, and allow direct waitlist removal, which also clears the retired Android beta list.

## Positioning
Parkdex is capture the flag for every park around you. Every park on the map can fly one player's flag; you take it by standing inside the boundary. It is social: handles, generated flags, crews, friends and leaderboards. Badges are off in production and are not part of the pitch.

## Capabilities and Constraints
Use real app screenshots in phone and laptop mockups. Android is in open beta: visitors join the Parkdex Testers Google Group, then opt in on Google Play. iPhone has an App Store waitlist with no promised launch date. Keep the landing application independent of the current Parkdex app. The cutover target is landing at `parkdex.app` with the production app at `web.parkdex.app`, and landing at `staging.parkdex.app` with the staging app at `staging.web.parkdex.app`. Store signup email durably in the landing environment's own database and do not wake the existing app database.

## Brand Commitments
Distinct, personal, interesting, and informed by Nathan's own website at www.nathanpannell.com. Short, credible copy. Real app content with the app's own flags. Use the app's onboarding wording for the rules and its exact point values. The park count comes from the production catalogue through `npm run sync-parks`. Kip the oystercatcher and the app's orange (#ff5a1f) carry the field app's identity. No decorative eyebrows or small navigation header.

## Evidence on Hand
../parkdex/README.md establishes product facts. The live portfolio says Nathan built Parkdex to visit all 117 provincial parks on Vancouver Island. Portfolio public/media includes existing authorized app captures and material assets. No testimonials, customer metrics, or launch dates supplied.
