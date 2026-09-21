# Device frame follow-up

User requested this after comparing the visual directions. No frame library or replacement asset is integrated yet. The current mockup hardware is provisional.

Figma's official prototype settings wrap a selected device size in a device container with a camera cutout. Its presentation settings distinguish fitting the complete device on screen from fixed-size clipping:

- https://help.figma.com/hc/en-us/articles/21158597546391-Set-prototype-device-and-background-settings
- https://help.figma.com/hc/en-us/articles/360040318013-Play-your-prototypes

Candidate implementations, to inspect and pin before integration:

- https://github.com/sneas/telephone: MIT SVG device component with iPhone 16 Max frame, buttons and Dynamic Island. ViewBox 415 by 843; screen approximately 386.8 by 820.7.
- https://github.com/picturepan2/devices.css: MIT established device library. iPhone 14 Pro frame 428 by 868 with a 390 by 830 screen.
- https://github.com/ephread/PommePlate: CC0 raw SVG/PNG frames for older iPhone models.

The supplied portrait captures are 714 by 1354 and 712 by 1359. They are wider relative to their height than a modern iPhone display. Preserve all content with contain sizing and a solid matte screen fill; reserve the camera cutout area outside the screenshot rectangle. Do not stretch, use cover, or place the camera over any screenshot content. Verify top navigation, bottom navigation and complete badge action remain visible.

Prefer the inspected SVG component or established library over hand-drawn hardware. Research does not establish that Figma itself uses either library. Apple product bezel downloads have separate usage restrictions and are not assumed to be freely redistributable website assets.
