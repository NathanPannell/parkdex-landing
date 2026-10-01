// Draws a badge the way the Parkdex app does (src/components/Badge.tsx there):
// a shaped frame with a rarity rim, stars, a biome-coloured name ribbon, a
// shine sweep, and holo foil on rare badges. Shared gradients and clip paths
// live once in renderBadgeDefs() so each badge stays small.
import type { Badge } from './badge-cards';

const C = 100;
const INK = '#14231C';

function scallop(points = 22, outer = 95, inner = 86): string {
  let d = '';
  for (let i = 0; i < points; i++) {
    const a0 = (i / points) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 0.5) / points) * Math.PI * 2 - Math.PI / 2;
    const a2 = ((i + 1) / points) * Math.PI * 2 - Math.PI / 2;
    const p0 = [C + Math.cos(a0) * inner, C + Math.sin(a0) * inner];
    const p1 = [C + Math.cos(a1) * outer * 1.04, C + Math.sin(a1) * outer * 1.04];
    const p2 = [C + Math.cos(a2) * inner, C + Math.sin(a2) * inner];
    d += `${i === 0 ? `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}` : ''} Q${p1[0].toFixed(1)} ${p1[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return `${d}Z`;
}

function hexPath(): string {
  const points = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return `${(C + Math.cos(a) * 96).toFixed(1)} ${(C + Math.sin(a) * 96).toFixed(1)}`;
  });
  return `M${points.join(' L')}Z`;
}

export const SHAPES: Record<string, string> = {
  circle: 'M100 6 A94 94 0 1 1 99.9 6Z',
  hex: hexPath(),
  shield: 'M100 5 C130 16 160 17 186 11 C194 88 178 152 100 196 C22 152 6 88 14 11 C40 17 70 16 100 5Z',
  arch: 'M14 186 Q14 196 24 196 L176 196 Q186 196 186 186 L186 92 A86 86 0 0 0 14 92Z',
  seal: scallop(),
};

const RIM: Record<string, [string, string]> = {
  common: ['#FFF8EC', '#FFF8EC'],
  uncommon: ['#BDEBFF', '#7FD3F7'],
  rare: ['#F3F5FF', '#A9B3D6'],
  epic: ['#FF9BD0', '#9B7BFF'],
  legendary: ['#FFF1A8', '#E9A800'],
};

const STARS: Record<string, number> = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };

const RIBBON: Record<string, [string, string]> = {
  coast: ['#0E6E86', '#FFF8EC'],
  forest: ['#1C5B43', '#FFF8EC'],
  mountain: ['#39479F', '#FFF8EC'],
  lake: ['#1F7FA8', '#FFF8EC'],
  waterfall: ['#4B3C9E', '#FFF8EC'],
  river: ['#2E7F9E', '#FFF8EC'],
  cave: ['#2A1F57', '#FFE27A'],
  marsh: ['#3E8A4A', '#FFF8EC'],
  heritage: ['#8C4A2F', '#FFF1D6'],
};

const escapeXml = (value: string) => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
const shapeOf = (badge: Badge) => (badge.shape && SHAPES[badge.shape] ? badge.shape : 'hex');
const rarityOf = (badge: Badge) => (RIM[badge.rarity] ? badge.rarity : 'common');

export function renderBadgeDefs(): string {
  const clips = Object.entries(SHAPES).map(([name, d]) => `<clipPath id="badge-clip-${name}"><path d="${d}"/></clipPath>`).join('');
  const rims = Object.entries(RIM).map(([name, [a, b]]) => `<linearGradient id="badge-rim-${name}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient>`).join('');
  return '<svg class="badge-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>'
    + clips + rims
    + '<linearGradient id="badge-holo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF6BD6"/><stop offset=".25" stop-color="#FFE66B"/><stop offset=".5" stop-color="#6BFFB8"/><stop offset=".75" stop-color="#6BB8FF"/><stop offset="1" stop-color="#C86BFF"/></linearGradient>'
    + '<pattern id="badge-lines" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="4" height="1.3" fill="#FFFFFF" opacity=".09"/></pattern>'
    + `<radialGradient id="badge-vignette" cx=".5" cy=".42" r=".62"><stop offset=".62" stop-color="${INK}" stop-opacity="0"/><stop offset="1" stop-color="${INK}" stop-opacity=".28"/></radialGradient>`
    + '<linearGradient id="badge-glint" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity=".85"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>'
    + '</defs></svg>';
}

function star(x: number, y: number, r: number): string {
  const points = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`;
  });
  return `<polygon points="${points.join(' ')}" fill="#FFD23F" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`;
}

function ribbon(text: string, biome: string): string {
  const [fill, ink] = RIBBON[biome] ?? RIBBON.forest;
  const upper = text.toUpperCase();
  const size = Math.max(9.5, Math.min(17, 190 / Math.max(upper.length, 1) + 1.2));
  const fit = upper.length > 13 ? ' textLength="138" lengthAdjust="spacingAndGlyphs"' : '';
  const edge = `fill="${fill}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"`;
  return `<path d="M2 150 L26 146 L26 178 L2 182 L12 166Z" ${edge}/><path d="M198 150 L174 146 L174 178 L198 182 L188 166Z" ${edge}/>`
    + `<path d="M18 142 Q100 128 182 142 L182 174 Q100 160 18 174Z" ${edge}/>`
    + `<text class="badge-svg__name" x="100" y="156" font-size="${size.toFixed(1)}" fill="${ink}" text-anchor="middle" dominant-baseline="middle"${fit}>${escapeXml(upper)}</text>`;
}

// shineSlot spreads the shine sweeps so the badges don't all glint at once.
export function renderBadgeSvg(badge: Badge, shineSlot = 0): string {
  const shape = shapeOf(badge);
  const rarity = rarityOf(badge);
  const d = SHAPES[shape];
  const stars = STARS[rarity];
  const shiny = rarity === 'rare' || rarity === 'epic' || rarity === 'legendary';
  const starY = shape === 'arch' ? 30 : 26;
  const starMarks = Array.from({ length: stars }, (_, i) => star(100 + (i - (stars - 1) / 2) * 15, starY, 6.5)).join('');
  return `<svg class="badge-svg" viewBox="-4 -4 208 208" role="img" aria-label="${escapeXml(`${badge.short} badge`)}">`
    + `<path d="${d}" fill="url(#badge-rim-${rarity})" stroke="${INK}" stroke-width="4" transform="translate(0 3)" opacity=".25"/>`
    + `<g clip-path="url(#badge-clip-${shape})">`
    + `<image href="/badges/${escapeXml(badge.scene)}.webp" x="-4" y="-4" width="208" height="208" preserveAspectRatio="xMidYMid slice"/>`
    + '<rect x="-10" y="-10" width="220" height="220" fill="url(#badge-lines)"/><rect x="-10" y="-10" width="220" height="220" fill="url(#badge-vignette)"/>'
    + (shiny ? '<rect class="badge-svg__holo" x="-60" y="-60" width="320" height="320" fill="url(#badge-holo)"/>' : '')
    + `<g transform="rotate(20 100 100)"><rect class="badge-svg__shine badge-svg__shine--${shineSlot % 8}" x="-120" y="-40" width="60" height="280" fill="url(#badge-glint)"/></g>`
    + '</g>'
    + `<path d="${d}" fill="none" stroke="url(#badge-rim-${rarity})" stroke-width="10"/>`
    + `<path d="${d}" fill="none" stroke="${INK}" stroke-width="3"/>`
    + `<path d="${d}" fill="none" stroke="#FFFFFF" stroke-opacity=".75" stroke-width="1.6" stroke-dasharray="4 3.2" transform="translate(100 100) scale(.9) translate(-100 -100)"/>`
    + starMarks + ribbon(badge.short, badge.biome)
    + '</svg>';
}
