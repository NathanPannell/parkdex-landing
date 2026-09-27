import { neon } from "@neondatabase/serverless";
import { createWaitlistHandler, type WaitlistList } from "../lib/waitlist.js";

export const config = { maxDuration: 10 };

function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url, { fetchOptions: { signal: AbortSignal.timeout(8000) } });
}

const handle = createWaitlistHandler({
  canonicalOrigin: process.env.WAITLIST_ALLOWED_ORIGIN,
  vercelUrl: process.env.VERCEL_URL,
  async saveSignup(email: string, list: WaitlistList) {
    const sql = database();
    // Table names cannot be query parameters, so each list has its own fixed statement.
    if (list === "app_store") {
      await sql`INSERT INTO app_store_waitlist_signups (email_normalized)
                VALUES (${email})
                ON CONFLICT (email_normalized) DO NOTHING`;
    } else {
      await sql`INSERT INTO android_beta_signups (email_normalized)
                VALUES (${email})
                ON CONFLICT (email_normalized) DO NOTHING`;
    }
  },
  async removeSignup(email) {
    const sql = database();
    // Removal is a full opt-out from both lists.
    await sql.transaction([
      sql`DELETE FROM android_beta_signups WHERE email_normalized = ${email}`,
      sql`DELETE FROM app_store_waitlist_signups WHERE email_normalized = ${email}`,
    ]);
  },
});

export default {
  fetch(request: Request): Promise<Response> {
    return handle(request);
  },
};
