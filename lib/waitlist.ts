export type SaveSignup = (email: string) => Promise<void>;
export type RemoveSignup = (email: string) => Promise<void>;

export type WaitlistConfig = {
  saveSignup: SaveSignup;
  removeSignup?: RemoveSignup;
  canonicalOrigin?: string;
  vercelUrl?: string;
};

const MAX_BODY_BYTES = 2048;
const SUCCESS = { ok: true };

function json(body: object, status: number): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length < 3 || email.length > 254 || /[^\x21-\x7e]/.test(email)) return null;
  const at = email.indexOf("@");
  if (at < 1 || at !== email.lastIndexOf("@")) return null;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (local.length > 64 || local.startsWith(".") || local.endsWith(".") || local.includes("..")) return null;
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) return null;
  if (domain.length > 253 || !domain.includes(".")) return null;
  const labels = domain.split(".");
  if (labels.some((label) => !label || label.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label))) return null;
  if (labels.at(-1)!.length < 2) return null;
  return email;
}

function allowedOrigin(request: Request, config: WaitlistConfig): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return false;
  const candidates = [new URL(request.url).origin, config.canonicalOrigin, config.vercelUrl && `https://${config.vercelUrl}`];
  return candidates.some((candidate) => {
    if (!candidate) return false;
    try {
      return origin === new URL(candidate).origin;
    } catch {
      return false;
    }
  });
}

async function readSmallBody(request: Request): Promise<string | null> {
  if (!request.body) return null;
  const contentLength = request.headers.get("Content-Length");
  if (contentLength && (!/^\d+$/.test(contentLength) || Number(contentLength) > MAX_BODY_BYTES)) return null;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export function createWaitlistHandler(config: WaitlistConfig): (request: Request) => Promise<Response> {
  return async (request) => {
    if (request.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);
    if (!allowedOrigin(request, config)) return json({ ok: false, error: "forbidden" }, 403);
    if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
      return json({ ok: false, error: "unsupported_media_type" }, 415);
    }

    let payload: unknown;
    try {
      const body = await readSmallBody(request);
      if (body === null) return json({ ok: false, error: "invalid_request" }, 400);
      payload = JSON.parse(body);
    } catch {
      return json({ ok: false, error: "invalid_request" }, 400);
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return json({ ok: false, error: "invalid_request" }, 400);
    }
    const fields = payload as Record<string, unknown>;
    const action = fields.action === undefined ? "join" : fields.action;
    if (action !== "join" && action !== "remove") {
      return json({ ok: false, error: "invalid_action" }, 400);
    }
    if (typeof fields.company === "string" && fields.company.trim()) return json(SUCCESS, 200);
    const email = normalizeEmail(fields.email);
    if (!email) return json({ ok: false, error: "invalid_email" }, 400);

    try {
      if (action === "remove") {
        if (!config.removeSignup) throw new Error("removeSignup is not configured");
        await config.removeSignup(email);
      } else {
        await config.saveSignup(email);
      }
      return json(SUCCESS, 200);
    } catch {
      return json({ ok: false, error: "unavailable" }, 503);
    }
  };
}
