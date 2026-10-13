import { KIP_APP_ORIGINS, LANDING_ORIGIN_BY_KIP_APP_ORIGIN } from "./app-origins";

export function siteUrlForApp(appUrl: string): string {
  const siteUrl = LANDING_ORIGIN_BY_KIP_APP_ORIGIN[appUrl];
  if (!siteUrl) throw new Error(`Unsupported VITE_APP_URL for landing links: ${appUrl}`);
  return siteUrl;
}

export function rewriteStaticAppLinks(html: string, appUrl: string): string {
  const siteUrl = siteUrlForApp(appUrl);
  // Canonical and share URLs are authored for production and follow the landing environment.
  return html.replaceAll(KIP_APP_ORIGINS.production, appUrl).replaceAll("https://parkdex.app/", `${siteUrl}/`);
}

export function createRobotsTxt(appUrl: string): string {
  const siteUrl = siteUrlForApp(appUrl);
  // Staging must never compete with production in search results.
  if (siteUrl !== "https://parkdex.app") return "User-agent: *\nDisallow: /\n";
  return `User-agent: *\nAllow: /\nDisallow: /mockups/\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

export function createSitemapXml(appUrl: string): string {
  const siteUrl = siteUrlForApp(appUrl);
  const urls = ["/", "/privacy/", "/support/", "/delete-account/"]
    .map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
