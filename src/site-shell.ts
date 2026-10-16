// The nav and footer shared by every fan page. The homepage opens the beta
// dialog in place; other pages send people to the homepage's beta section.
const LINKS = [
  { key: 'play', href: '/#play', label: 'How to play' },
  { key: 'points', href: '/#points', label: 'Scoring' },
  { key: 'near-me', href: '/near-me/', label: 'Park map' },
];

export function renderNav(active: string): string {
  const links = LINKS.map(({ key, href, label }) =>
    `<a href="${active === 'home' && href.startsWith('/#') ? href.slice(1) : href}"${key === active ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const cta = active === 'home'
    ? '<button class="fan-button fan-button--small" type="button" data-beta-open>Get the beta</button>'
    : '<a class="fan-button fan-button--small" href="/#get">Get the beta</a>';
  return `<header class="fan-nav"><div class="fan-nav__inner">`
    + `<a class="fan-brand" href="/" aria-label="Parkdex home"><img src="/favicon-64x64.png" width="32" height="32" alt="" /><span>Parkdex</span></a>`
    + `<nav class="fan-nav__links" aria-label="Pages">${links}</nav>${cta}</div></header>`;
}

export function renderFooter(): string {
  return `<footer class="fan-footer"><div class="fan-footer__inner">`
    + `<div class="fan-footer__brand"><a class="fan-brand" href="/"><img src="/favicon-64x64.png" width="32" height="32" alt="" /><span>Parkdex</span></a>`
    + `<p>Capture the flag for real parks. Plant yours, hold it, and take your friends’.</p></div>`
    + `<div class="fan-footer__cols">`
    + `<nav aria-label="Explore"><h2>Explore</h2><ul>${LINKS.map(({ href, label }) => `<li><a href="${href}">${label}</a></li>`).join('')}</ul></nav>`
    + `<nav aria-label="Help"><h2>Help</h2><ul><li><a href="/#get">Get the beta</a></li><li><a href="/support/">Support</a></li><li><a href="/delete-account/">Delete account</a></li></ul></nav>`
    + `<nav aria-label="About"><h2>About</h2><ul><li><a href="/privacy/">Privacy</a></li><li><a href="/support/">Contact</a></li></ul></nav>`
    + `</div></div>${renderFooterFine()}</footer>`;
}

// The line below the footer rule, shared with the homepage and info pages.
export function renderFooterFine(): string {
  return '<div class="fan-footer__fine"><p>© 2026 Parkdex · Made in Victoria, British Columbia</p>'
    + '<p class="fan-byline">Made by <a href="https://www.nathanpannell.com/">Nathan Pannell</a></p></div>';
}
