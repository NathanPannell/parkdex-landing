import { flagBody, flagPinSvg, type FlagWeather } from './flag';

export interface Park {
  id: string;
  name: string;
  category: string;
  region: string;
  lat: number;
  lng: number;
}

// Seeds for the decorative flags. They draw the same generated flags the app
// gives players, but belong to nobody.
export const DEMO_SEEDS = ['landing-tide', 'landing-fern', 'landing-cedar', 'landing-otter', 'landing-orca', 'landing-heron', 'landing-salal', 'landing-kelp', 'landing-moss', 'landing-arbutus'];

/** A generated flag on a pole, with the cloth in its own group so CSS can make it wave. */
export function renderPlantedFlag(seed: string, weather: FlagWeather = 0, className = 'planted'): string {
  const id = `planted-${seed}`;
  return `<svg class="${className}" viewBox="0 0 92 150" aria-hidden="true" focusable="false">`
    + '<rect x="6" y="6" width="5" height="144" rx="2.5" fill="#14231C"/>'
    + `<g transform="translate(11 10) scale(1.3)"><g class="planted__cloth">${flagBody(seed, { weather, idPrefix: id })}</g></g>`
    + '<circle cx="8.5" cy="6" r="5" fill="#FFC93C" stroke="#14231C" stroke-width="2"/></svg>';
}

/** A single generated flag cloth, for scoreboard rows and small accents. */
export function renderFlagCloth(seed: string, className = 'flag-cloth'): string {
  return `<svg class="${className}" viewBox="-1 -1 62 42" aria-hidden="true" focusable="false">${flagBody(seed, { idPrefix: `cloth-${seed}` })}</svg>`;
}

// The flags along the hero hill: a seed and a weather each. Their spots and
// heights are in CSS (.hill__flag--N); later ones hide on narrow screens.
const HILL_FLAGS: Array<[number, FlagWeather]> = [[7, 1], [8, 0], [6, 0], [2, 2], [3, 0], [4, 0]];

export function renderFlagHill(): string {
  const flags = HILL_FLAGS.map(([seedIndex, weather], index) =>
    `<span class="hill__flag hill__flag--${index + 1}">${renderPlantedFlag(DEMO_SEEDS[seedIndex], weather)}</span>`).join('');
  return `<div class="hill" aria-hidden="true">${flags}`
    + '<svg class="hill__land" viewBox="0 0 1440 160" preserveAspectRatio="none" focusable="false">'
    + '<path class="hill__back" d="M0 92C180 40 330 34 520 64S880 120 1060 76 1330 30 1440 52V160H0Z"/>'
    + '<path class="hill__front" d="M0 128C220 96 420 92 640 112S1040 150 1240 118 1400 98 1440 102V160H0Z"/>'
    + '</svg></div>';
}

// The homepage park map: a static basemap rendered once from OpenFreeMap
// (scripts/render-park-basemap.mjs) and its exact bounds, so park dots can be
// placed on it in the same Web Mercator projection without loading a map.
export interface Basemap { width: number; height: number; west: number; south: number; east: number; north: number }

const mercator = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

function project(basemap: Basemap) {
  const top = mercator(basemap.north);
  const span = top - mercator(basemap.south);
  return (park: Park) => ({
    x: Math.round(((park.lng - basemap.west) / (basemap.east - basemap.west)) * basemap.width),
    y: Math.round(((top - mercator(park.lat)) / span) * basemap.height),
  });
}

/** Pick a spread of parks to plant demo flags on: one from each band along the island's length. */
function flagSpots(parks: Park[], count: number): Park[] {
  const along = (park: Park) => park.lat - park.lng * 0.6;
  const sorted = [...parks].sort((a, b) => along(a) - along(b));
  const step = sorted.length / count;
  return Array.from({ length: count }, (_, index) => sorted[Math.floor(index * step + step / 2)]);
}

/**
 * Every catalogue park as a dot on the basemap, with a few demo flags planted
 * on top. The drawing is decorative; the park map page is the interactive version.
 */
export function renderParkDots(parks: Park[], basemap: Basemap, image = '/images/park-basemap.webp'): string {
  if (parks.length === 0) return '';
  const point = project(basemap);
  const dots = parks.map((park) => {
    const { x, y } = point(park);
    return `<circle class="dots__dot dots__dot--${park.category}" cx="${x}" cy="${y}" r="10"/>`;
  }).join('');
  const flags = flagSpots(parks, 7).map((park, index) => {
    const { x, y } = point(park);
    // The pin's pole stands at x 8, y 54 of a 48 by 56 box.
    const scale = 2;
    return `<g class="dots__flag" transform="translate(${Math.round(x - 8 * scale)} ${Math.round(y - 54 * scale)}) scale(${scale})">`
      + flagPinSvg(DEMO_SEEDS[index], { idPrefix: `dots-${index}` }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '') + '</g>';
  }).join('');
  return `<svg class="dots" viewBox="0 0 ${basemap.width} ${basemap.height}" role="img" aria-label="Map of ${parks.length} Parkdex parks across Vancouver Island and the Gulf Islands" focusable="false">`
    + `<image href="${image}" width="${basemap.width}" height="${basemap.height}"/>${dots}${flags}</svg>`;
}
