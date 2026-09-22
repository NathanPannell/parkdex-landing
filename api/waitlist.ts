import { neon } from "@neondatabase/serverless";
import { createWaitlistHandler } from "../lib/waitlist.js";

export const config = { maxDuration: 10 };

const handle = createWaitlistHandler({
  canonicalOrigin: process.env.WAITLIST_ALLOWED_ORIGIN,
  vercelUrl: process.env.VERCEL_URL,
  async saveSignup(email) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not configured");
    const sql = neon(url, { fetchOptions: { signal: AbortSignal.timeout(8000) } });
    await sql`INSERT INTO waitlist_signups (email_normalized)
              VALUES (${email})
              ON CONFLICT (email_normalized) DO NOTHING`;
  },
  async removeSignup(email) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not configured");
    const sql = neon(url, { fetchOptions: { signal: AbortSignal.timeout(8000) } });
    await sql`DELETE FROM waitlist_signups
              WHERE email_normalized = ${email}`;
  },
});

export default {
  fetch(request: Request): Promise<Response> {
    return handle(request);
  },
};
