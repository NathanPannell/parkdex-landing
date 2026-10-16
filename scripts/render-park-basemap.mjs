// Renders the homepage park map's basemap once: OpenFreeMap's Positron style,
// recoloured to the page (no labels), saved as public/images/park-basemap.webp
// with its exact Web Mercator bounds in src/park-basemap.json. The page then
// plots parks on the image without loading a map library.
// Re-run only if the parks spread beyond these bounds:
//   npm i --no-save playwright-core
//   PW_EXE=<path to a Chromium or headless shell> node scripts/render-park-basemap.mjs out/park-basemap
// then copy out/park-basemap.webp and out/park-basemap.json into place.
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
const [W, H] = [1600, 1120];
const out = process.argv[2];
const browser = await chromium.launch({ executablePath: process.env.PW_EXE, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.setContent(`<!doctype html><html><head><link rel="stylesheet" href="https://unpkg.com/maplibre-gl@5.6.0/dist/maplibre-gl.css"><script src="https://unpkg.com/maplibre-gl@5.6.0/dist/maplibre-gl.js"></script><style>html,body,#m{margin:0;width:${W}px;height:${H}px}</style></head><body><div id="m"></div></body></html>`);
await page.waitForFunction(() => window.maplibregl);
const result = await page.evaluate(async () => {
  const style = await (await fetch('https://tiles.openfreemap.org/styles/positron')).json();
  for (const layer of style.layers) {
    const id = layer.id;
    if (layer.type === 'symbol' || /boundary|aeroway|building/.test(id)) { layer.layout = { ...(layer.layout || {}), visibility: 'none' }; continue; }
    if (layer.type === 'background') layer.paint = { 'background-color': '#f4f1e4' };
    else if (layer.type === 'fill' && /water/.test(id)) layer.paint = { 'fill-color': '#bfe3f0' };
    else if (layer.type === 'line' && /water/.test(id)) layer.paint = { ...layer.paint, 'line-color': '#bfe3f0' };
    else if (layer.type === 'fill' && /park|landcover|landuse/.test(id)) layer.paint = { ...layer.paint, 'fill-color': '#dcefd6', 'fill-opacity': 0.8 };
    else if (layer.type === 'line' && /road|highway|tunnel|bridge|rail/.test(id)) layer.paint = { ...layer.paint, 'line-color': '#ffffff', 'line-opacity': 0.7 };
  }
  const map = new maplibregl.Map({ container: 'm', style, bounds: [[-128.9, 47.9], [-122.7, 51.0]], fitBoundsOptions: { padding: 0 }, interactive: false, attributionControl: false, canvasContextAttributes: { preserveDrawingBuffer: true }, preserveDrawingBuffer: true, pixelRatio: 1 });
  await new Promise((resolve) => map.once('idle', resolve));
  const b = map.getBounds();
  return { data: map.getCanvas().toDataURL('image/png'), west: b.getWest(), south: b.getSouth(), east: b.getEast(), north: b.getNorth() };
});
const png = Buffer.from(result.data.split(',')[1], 'base64');
await sharp(png).webp({ quality: 80 }).toFile(out + '.webp');
writeFileSync(out + '.json', JSON.stringify({ width: W, height: H, west: result.west, south: result.south, east: result.east, north: result.north }, null, 2) + '\n');
console.log(result.west, result.south, result.east, result.north);
await browser.close();
