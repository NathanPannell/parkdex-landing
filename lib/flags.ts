/** A flag that is up right now: which park, whose generated flag, and since when. */
export type LiveFlag = { parkId: string; flagSeed: string; since: string };

export type FlagsConfig = {
  /** The Parkdex web app whose public `GET /api/game/flags` this mirrors. */
  appOrigin: string;
  fetch?: typeof fetch;
};

// Vercel's CDN keeps a copy for five minutes, so however many people open the
// homepage, the app's database is asked at most about once per five minutes,
// and never while nobody is looking.
const CACHED = "public, max-age=60, s-maxage=300, stale-while-revalidate=600";
const PARK_ID = /^[a-z0-9][a-z0-9-]{0,127}$/;
const FLAG_SEED = /^[0-9a-z-]{1,64}$/i;

function json(body: object, status: number, cache: string): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": cache, "X-Content-Type-Options": "nosniff" },
  });
}

/** Keeps only what the map draws. Handles, crews and badges stay in the app. */
export function liveFlags(body: unknown): LiveFlag[] | null {
  const flags = (body as { flags?: unknown } | null)?.flags;
  if (!Array.isArray(flags)) return null;
  return flags.flatMap((flag: Record<string, unknown>) => {
    const { parkId, flagSeed, since } = flag ?? {};
    if (typeof parkId !== "string" || !PARK_ID.test(parkId)) return [];
    if (typeof flagSeed !== "string" || !FLAG_SEED.test(flagSeed)) return [];
    if (typeof since !== "string" || !Number.isFinite(Date.parse(since))) return [];
    return [{ parkId, flagSeed, since }];
  });
}

export function createFlagsHandler(config: FlagsConfig) {
  const get = config.fetch ?? fetch;
  return async (request: Request): Promise<Response> => {
    if (request.method !== "GET" && request.method !== "HEAD") return json({ error: "method_not_allowed" }, 405, "no-store");
    try {
      const response = await get(`${config.appOrigin}/api/game/flags`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) return json({ error: "unavailable" }, 502, "no-store");
      const body = await response.json() as { serverTime?: unknown };
      const flags = liveFlags(body);
      if (!flags) return json({ error: "unavailable" }, 502, "no-store");
      const serverTime = typeof body.serverTime === "string" && Number.isFinite(Date.parse(body.serverTime))
        ? body.serverTime
        : new Date().toISOString();
      return json({ flags, serverTime }, 200, CACHED);
    } catch {
      return json({ error: "unavailable" }, 502, "no-store");
    }
  };
}
