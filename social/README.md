# Share card

`og-card.html` is the source for `public/og-image.jpg`, the 1200x630 image used by Open Graph and Twitter cards. It is not part of the build.

To update it, run `npm run dev -- --port 4327`, open `http://127.0.0.1:4327/social/og-card.html`, and screenshot the `.card` element at 1200x630 with device scale 1. Save it as a progressive JPEG under 300 KB at `public/og-image.jpg`. Keep it to Kip, the wordmark and the "Explore with Parkdex" call to action, stacked in the center so it stays legible at phone size and survives square thumbnail crops. Check a 300px-wide copy and a center square crop before committing.

After a production release, check the card with the Facebook Sharing Debugger and a LinkedIn Post Inspector preview so they refresh their caches.
