// The nav and footer shared by every fan page. The homepage opens the beta
// dialog in place; other pages send people to the homepage's beta section.
const LINKS = [
  { key: 'badges', href: '/badges/', label: 'Badges' },
  { key: 'near-me', href: '/near-me/', label: 'Near me' },
  { key: 'day-trips', href: '/day-trips/', label: 'Day trips' },
];

export function renderNav(active: string): string {
  const links = LINKS.map(({ key, href, label }) =>
    `<a href="${href}"${key === active ? ' aria-current="page"' : ''}>${label}</a>`).join('');
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
    + `<p>A collecting game for the parks around Victoria. Visit somewhere new, add its badge, repeat.</p></div>`
    + `<div class="fan-footer__cols">`
    + `<nav aria-label="Explore"><h2>Explore</h2><ul>${LINKS.map(({ href, label }) => `<li><a href="${href}">${label}</a></li>`).join('')}</ul></nav>`
    + `<nav aria-label="Help"><h2>Help</h2><ul><li><a href="/#get">Get the beta</a></li><li><a href="/support/">Support</a></li><li><a href="/delete-account/">Delete account</a></li></ul></nav>`
    + `<nav aria-label="About"><h2>About</h2><ul><li><a href="/privacy/">Privacy</a></li><li><a href="https://www.nathanpannell.com/">Nathan Pannell</a></li></ul></nav>`
    + `</div></div><div class="fan-footer__fine"><p>© 2026 Parkdex</p><p>Made in Victoria, British Columbia</p></div></footer>`;
}
