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

// Two rows scrolling in opposite directions. Each row repeats its cards so the
// CSS loop can translate by exactly half its width without a visible seam; the
// copies are hidden from assistive technology.
export function renderMarquee(badges: Badge[]): string {
  const half = Math.ceil(badges.length / 2);
  const rows = [badges.slice(0, half), badges.slice(half)].filter((row) => row.length > 0);
  return rows.map((row, index) => {
    const cards = row.map((badge) => card(badge, false)).join('') + row.map((badge) => card(badge, true)).join('');
    return `<ul class="badge-marquee__row${index % 2 ? ' badge-marquee__row--reverse' : ''}">${cards}</ul>`;
  }).join('');
}

// The wall leads with the rarest badges, then alphabetical within a rarity.
export function renderWall(badges: Badge[]): string {
  const rank = (rarity: string) => {
    const index = RARITY_ORDER.indexOf(rarity);
    return index === -1 ? RARITY_ORDER.length : index;
  };
  const sorted = [...badges].sort((a, b) => rank(a.rarity) - rank(b.rarity) || a.short.localeCompare(b.short));
  return sorted.map((badge) => card(badge, false)).join('');
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
    return `<li class="badge-entry" id="${escapeHtml(badge.id)}" data-rarity="${escapeHtml(badge.rarity)}">`
      + `<img src="/badges/${escapeHtml(badge.scene)}.webp" width="480" height="480" loading="lazy" alt="${escapeHtml(`${badge.name} badge art`)}" />`
      + `<div class="badge-entry__body"><p class="badge-entry__meta"><span class="badge-chip">${escapeHtml(badge.rarity)}</span>${escapeHtml(category)}</p>`
      + `<h2>${escapeHtml(badge.name)}</h2><p>${escapeHtml(badge.blurb)}</p>`
      + `<a class="badge-entry__map" href="/near-me/#${escapeHtml(badge.id)}">See it on the map</a></div></li>`;
  }).join('');
}
