# iPhone 16 Max frame

`iphone-16-max.svg` is the unmodified SVG extracted from the upstream
`@sneas/telephone` package's `packages/telephone/src/iphone-16-max.html.ts`
template. The package is MIT licensed by Dimah Snisarenko.

- Upstream repository: https://github.com/sneas/telephone
- Upstream source: https://github.com/sneas/telephone/blob/main/packages/telephone/src/iphone-16-max.html.ts
- Package version reviewed: `@sneas/telephone` `1.1.2`
- Pinned package tarball: https://registry.npmjs.org/@sneas/telephone/-/telephone-1.1.2.tgz
- Tarball SHA-1: `8b0aea6b96ddc6565dff43d649d501b10aee4b2d`
- Tarball Subresource Integrity: `sha512-qgW84VqFqiFcEa9M23dwwgfM/P0RPRVkFt4gn5q4m6zLdoFVxLBir1d59CdcH1NOHQBzyj4bRx6ZaaPErp8cZg==`
- Upstream git commit: `cdbbe2681e9425903f8dd0cfb47890a3f297699f`
- Source SVG viewBox: `0 0 415 843`
- Upstream screen slot: left/right `3.4%`, top/bottom `1.32%`
- Upstream screen corner radius: `calc(width * 0.122126436781609)`
- Hardware details: left volume/action buttons, right side button, Dynamic Island, camera and sensor details

The SVG is retained as a visual overlay. Parkdex screenshot content is rendered
in the separate `device-frame__media` layer, with `object-fit: contain` and
matching 7% top and bottom mat insets. This keeps the complete source image
visible, including the `714x1354`, `712x1359`, and `375x844` captures, while
keeping the Dynamic Island above the screenshot content and the image rectangle
inside the rounded display corners.

The local CSS wrapper and this provenance file are Parkdex additions. Preserve
the MIT notice in `public/frames/LICENSE` when the asset is redistributed.
