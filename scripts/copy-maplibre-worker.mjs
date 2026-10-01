// MapLibre v6 loads its worker as a separate ES module next to the main bundle.
// Vite does not emit it, so copy the worker and its shared chunk into public/.
import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve(import.meta.dirname, '../node_modules/maplibre-gl/dist');
const output = resolve(import.meta.dirname, '../public/maplibre');
mkdirSync(output, { recursive: true });
for (const file of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) copyFileSync(resolve(source, file), resolve(output, file));
