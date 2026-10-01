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
}

const RARITY_ORDER = ['legendary', 'rare', 'uncommon', 'common'];

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function card(badge: Badge, decorative: boolean): string {
  const alt = decorative ? '' : escapeHtml(`${badge.name} badge art`);
  const hidden = decorative ? ' aria-hidden="true"' : '';
  return `<li class="badge-card" data-rarity="${escapeHtml(badge.rarity)}"${hidden}>`
    + `<img src="/badges/${escapeHtml(badge.scene)}.webp" width="480" height="480" loading="lazy" alt="${alt}" />`
    + `<span class="badge-card__rarity">${escapeHtml(badge.rarity)}</span>`
    + `<span class="badge-card__name">${escapeHtml(badge.short)}</span></li>`;
}

function rank(rarity: string): number {
  const index = RARITY_ORDER.indexOf(rarity);
  return index === -1 ? RARITY_ORDER.length : index;
}

// A page of the Dex: hexagon badges like the app's, rarest first, followed
// by a few empty slots to show there is more to collect.
export function renderDexPage(badges: Badge[], filled = 8, empty = 4): string {
  const shown = [...badges].sort((a, b) => rank(a.rarity) - rank(b.rarity) || a.short.localeCompare(b.short)).slice(0, filled);
  const slots = shown.map((badge) => `<li class="dex-slot" data-rarity="${escapeHtml(badge.rarity)}">`
    + `<a class="dex-slot__link" href="/badges/#${escapeHtml(badge.id)}"><span class="dex-slot__hex"><img src="/badges/${escapeHtml(badge.scene)}.webp" width="480" height="480" loading="lazy" alt="" /></span>`
    + `<span class="dex-slot__ribbon">${escapeHtml(badge.short)}</span><span class="fan-sr-only">, ${escapeHtml(badge.rarity)} badge</span></a></li>`);
  for (let index = 0; index < empty; index++) {
    slots.push('<li class="dex-slot dex-slot--empty" aria-hidden="true"><span class="dex-slot__hex"><span>?</span></span></li>');
  }
  return slots.join('');
}

const CATEGORY_LABEL: Record<string, string> = {
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
      + `<img src="/badges/${escapeHtml(badge.scene)}.webp" width="480" height="480" loading="lazy" alt="${escapeHtml(`${badge.name} badge art`)}" />`
      + `<div class="badge-entry__body"><p class="badge-entry__meta"><span class="badge-chip">${escapeHtml(badge.rarity)}</span>${escapeHtml(category)}</p>`
      + `<h2>${escapeHtml(badge.name)}</h2><p>${escapeHtml(badge.blurb)}</p>`
      + `<a class="badge-entry__map" href="/near-me/#${escapeHtml(badge.id)}">See it on the map</a></div></li>`;
  }).join('');
}
