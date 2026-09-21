# Design verification

The mechanical Impeccable detector ran once on index.html and src. It reported flat-type-hierarchy because it did not resolve the CSS imported from the Vite TypeScript entry. The actual rendered desktop h1 is 95.04px, body 18px, and signup heading 16px. This finding is a static-resolution false positive, with browser screenshots as evidence.

The visual reference is Nathan's existing public portfolio, not an AI-generated comp. The user asked for real app screenshots in phone and laptop mockups; restrained matte CSS chassis deliberately follow this explicit brief and existing approved portfolio treatment.

The first pass fixed HTML image height attributes overriding screen aspect ratios. The mobile reading order was adjusted so the email signup precedes screenshots. A fresh desktop app capture replaces the old image showing duplicated navigation.

Independent finish review returned SHIP after correcting the 320px header, reserving footer space on short desktop screens, and aligning the surface brief with the native screenshot viewer. Fresh deployed captures at 320, 390, 1280, 1440 and 1697 pixels show legible matte hardware and intact content. The 1440x900 document has one extra pixel of bottom padding, with all content visible. No unresolved defect was found in the bounded confirmation review.

Code review's pending-input mismatch was fixed by making the email readonly during submission and disabling successful repeat submission until the visitor edits it. The live WAF limits POSTs to five per IP per minute. Browser signup and the rate-limit retry path passed, and test records were verified then removed. Connection emulation was not reliable in the browser harness, so no offline test pass is claimed.
