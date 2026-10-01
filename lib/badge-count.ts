import { KIP_APP_ORIGIN_BY_LANDING_ORIGIN, KIP_APP_ORIGINS } from "../src/app-origins.js";

// Parks without a scene are catalogue skeletons with no badge art yet, so they
// are not counted as badges.
export function countBadgeParks(snapshot: unknown): number | null {
  const parks = (snapshot as { parks?: unknown } | null)?.parks;
  if (!Array.isArray(parks)) return null;
  return parks.filter((park) => {
    const scene = (park as { scene?: unknown } | null)?.scene;
    return typeof scene === "string" && scene.trim() !== "";
  }).length;
}

export async function fetchBadgeCount(appOrigin: string, fetcher: typeof fetch = fetch, timeoutMs = 8000): Promise<number | null> {
  try {
    const response = await fetcher(`${appOrigin}/api/content/snapshot`, { signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) return null;
    return countBadgeParks(await response.json());
  } catch {
    return null;
  }
}

export function appOriginForRequest(requestUrl: string, branch = process.env.VERCEL_GIT_COMMIT_REF): string {
  const origin = new URL(requestUrl).origin;
  return KIP_APP_ORIGIN_BY_LANDING_ORIGIN[origin]
    ?? (branch === "staging" ? KIP_APP_ORIGINS.staging : KIP_APP_ORIGINS.production);
}

export function createBadgeCountHandler(fetcher: typeof fetch = fetch) {
  return async (request: Request): Promise<Response> => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
    }
    const count = await fetchBadgeCount(appOriginForRequest(request.url), fetcher);
    if (count === null) {
      return Response.json({ ok: false }, { status: 502, headers: { "Cache-Control": "no-store" } });
    }
    // The snapshot is large and uncached, so the CDN serves this answer for an hour.
    return Response.json({ ok: true, count }, {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" },
    });
  };
}

// The HTML ships with this count so crawlers and no-JS visitors still see a number.
export const FALLBACK_BADGE_COUNT = 100;

export function applyBadgeCount(html: string, count: number): string {
  const fallback = String(FALLBACK_BADGE_COUNT);
  return html
    .replaceAll(`content="${fallback} park badges`, `content="${count} park badges`)
    // The animated count starts from zeros padded to the final width.
    .replace(`data-count="${fallback}" aria-hidden="true">${"0".repeat(fallback.length)}<`,
      `data-count="${count}" aria-hidden="true">${"0".repeat(String(count).length)}<`)
    .replace(`<span class="outdoor-sr-only">${fallback}</span> park badges`, `<span class="outdoor-sr-only">${count}</span> park badges`);
}
