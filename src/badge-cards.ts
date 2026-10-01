import { renderBadgeSvg } from './badge-svg';

export interface Badge {
  id: string;
  name: string;
  short: string;
  rarity: string;
  biome: string;
  scene: string;
  blurb: string;
  category?: string;
  lat?: number;
  lng?: number;
  shape?: string;
  seed?: number;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

// A honeycomb band of badges. start offsets which badges a band begins with,
// so stacked bands down the page don't repeat each other. Rows alternate by half a tile so the
// shapes interlock. Tiles repeat to fill the screen; the wall is decorative
// (the Badges page is the accessible list), so tiles are hidden from screen
// readers and skipped by keyboard focus. data-ring is each tile's distance
// from the centre, which staggers the ripple animation outward.
export function renderBadgeWall(badges: Badge[], cols = 14, rows = 11, start = 0): string {
  if (badges.length === 0) return '';
  const order = [...badges].sort((a, b) => ((a.seed ?? 0) * 7919) % 997 - ((b.seed ?? 0) * 7919) % 997 || a.id.localeCompare(b.id));
  const midRow = (rows - 1) / 2;
  const midCol = (cols - 1) / 2;
  let index = start;
  const out: string[] = [];
  for (let row = 0; row < rows; row++) {
    const tiles: string[] = [];
    for (let col = 0; col < cols; col++) {
      const badge = order[index % order.length];
      const x = col + (row % 2) * 0.5 - midCol;
      const y = (row - midRow) * 0.87;
      const ring = Math.min(9, Math.round(Math.hypot(x, y)));
      tiles.push(`<a class="wall-tile" href="/badges/#${escapeHtml(badge.id)}" tabindex="-1" data-ring="${ring}" data-rarity="${escapeHtml(badge.rarity)}">${renderBadgeSvg(badge, index)}</a>`);
      index++;
    }
    out.push(`<div class="wall-row${row % 2 ? ' wall-row--offset' : ''}">${tiles.join('')}</div>`);
  }
  return out.join('');
}

export const CATEGORY_LABEL: Record<string, string> = {
  municipal: 'Municipal park',
  regional: 'Regional park',
  provincial: 'Provincial park',
  community: 'Community park',
};

// Full entries for the Badges page: art, rarity, park type and the park blurb.
export function renderBadgeList(badges: Badge[]): string {
  return [...badges].sort((a, b) => a.short.localeCompare(b.short)).map((badge) => {
    const category = CATEGORY_LABEL[badge.category ?? ''] ?? 'Park';
    return `<li class="badge-entry" id="${escapeHtml(badge.id)}" data-rarity="${escapeHtml(badge.rarity)}" data-search="${escapeHtml(`${badge.name} ${badge.short} ${badge.rarity} ${category} ${badge.blurb}`.toLowerCase())}">`
      + `<div class="badge-entry__badge">${renderBadgeSvg(badge, badges.indexOf(badge))}</div>`
      + `<div class="badge-entry__body"><p class="badge-entry__meta"><span class="badge-chip">${escapeHtml(badge.rarity)}</span>${escapeHtml(category)}</p>`
      + `<h2>${escapeHtml(badge.name)}</h2><p>${escapeHtml(badge.blurb)}</p>`
      + `<a class="badge-entry__map" href="/near-me/#${escapeHtml(badge.id)}">See it on the map</a></div></li>`;
  }).join('');
}
