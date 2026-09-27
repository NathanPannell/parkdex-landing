const ISSUER_BY_APP_URL: Readonly<Record<string, string>> = {
  "https://web.parkdex.app": "https://parkdex.app",
  "https://staging.web.parkdex.app": "https://staging.parkdex.app",
};

export function siteUrlForApp(appUrl: string): string {
  const siteUrl = ISSUER_BY_APP_URL[appUrl];
  if (!siteUrl) throw new Error(`Unsupported VITE_APP_URL for landing links: ${appUrl}`);
  return siteUrl;
}

export function rewriteStaticAppLinks(html: string, appUrl: string): string {
  const siteUrl = siteUrlForApp(appUrl);
  // Canonical and share URLs are authored for production and follow the landing environment.
  return html.replaceAll("https://web.parkdex.app", appUrl).replaceAll("https://parkdex.app/", `${siteUrl}/`);
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

export function createMcpMetadata(appUrl: string) {
  // The app URL selects production or staging; existing MCP issuer/resource IDs stay on the apex.
  const issuer = ISSUER_BY_APP_URL[appUrl];
  if (!issuer) throw new Error(`Unsupported VITE_APP_URL for MCP metadata: ${appUrl}`);

  return {
    authorizationServer: {
      issuer: `${issuer}/`,
      authorization_endpoint: `${issuer}/authorize`,
      token_endpoint: `${issuer}/token`,
      registration_endpoint: `${issuer}/register`,
      revocation_endpoint: `${issuer}/revoke`,
      scopes_supported: ["mcp"],
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      token_endpoint_auth_methods_supported: ["none"],
      revocation_endpoint_auth_methods_supported: ["none"],
      code_challenge_methods_supported: ["S256"],
    },
    protectedResource: {
      resource: `${issuer}/mcp`,
      authorization_servers: [`${issuer}/`],
      scopes_supported: ["mcp"],
      bearer_methods_supported: ["header"],
    },
  };
}
