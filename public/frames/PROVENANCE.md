# Device frame assets

These replacement device frames were requested in [parkdex-landing issue #4](https://github.com/NathanPannell/parkdex-landing/issues/4) and supplied by the repository owner in a comment on [portfolio-2026 issue #5](https://github.com/NathanPannell/portfolio-2026/issues/5#issuecomment-5789804979).

| Local asset | Source attachment | Processing | Output dimensions |
| --- | --- | --- | --- |
| `parkdex-laptop-frame.webp` | [Laptop frame](https://github.com/user-attachments/assets/8c34a1ae-2e88-4845-afc7-bbf794981c8d) | Resized from 4608 × 2675; transparency preserved; encoded as lossless WebP. | 2600 × 1509 |
| `parkdex-phone-frame.webp` | [Phone frame](https://github.com/user-attachments/assets/f767709a-3b7a-4cf8-adbf-53985c02a357) | Cropped the transparent canvas to the phone silhouette at `(1460, 329)–(3547, 4670)`, then resized; transparency preserved; encoded as lossless WebP. | 1252 × 2604 |

Both images are transparent frame overlays. The phone frame uses a display aperture aspect ratio of about 0.461. Screens inside it use `object-fit: cover`; inspect each screenshot for critical content near its top and bottom edges.

## Phone screen captures

| Local asset | Source | Processing | Output dimensions |
| --- | --- | --- | --- |
| `../images/hero-map-mobile.webp` | [Parkdex live map](https://web.parkdex.app/?view=map&mode=discover) | Captured in Chrome at a 409 × 888 mobile viewport with All selected and Progress off; encoded as lossless WebP. | 409 × 888 |
| `../images/sealed-arrival-after.png` | Owner-selected after screen from the [Sealed Impressions evidence](https://github.com/NathanPannell/parkdex/tree/cacff6540fa84c06c702ef8b2dce7b20aa003178/docs/pr-evidence/sealed-impressions) | Source capture retained. Centered `object-fit: cover` trims about 15 px from the top and bottom to fill the phone aperture. The Parkdex header, park details, and Claim + photo action remain visible. | 375 × 843 |
| `../images/sealed-collection-after.png` | Owner-selected after screen from the [Sealed Impressions evidence](https://github.com/NathanPannell/parkdex/tree/cacff6540fa84c06c702ef8b2dce7b20aa003178/docs/pr-evidence/sealed-impressions) | Source capture retained. Centered `object-fit: cover` trims about 15 px from the top and bottom to fill the phone aperture. The collection heading and latest postcard remain visible. | 367 × 825 |
