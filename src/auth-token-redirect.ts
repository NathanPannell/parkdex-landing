import { KIP_APP_ORIGIN_BY_LANDING_ORIGIN } from "./app-origins";

const AUTH_TOKEN_KEYS = ["resetToken", "verificationToken"] as const;

export function authTokenRedirectTarget(origin: string, hash: string): string | null {
  const appOrigin = KIP_APP_ORIGIN_BY_LANDING_ORIGIN[origin];
  if (!appOrigin || !hash.startsWith("#")) return null;

  const fragmentParameters = new URLSearchParams(hash.slice(1));
  const entries = [...fragmentParameters.entries()];
  if (entries.length !== 1) return null;
  const [key, value] = entries[0];
  if (!AUTH_TOKEN_KEYS.includes(key as (typeof AUTH_TOKEN_KEYS)[number]) || !value) return null;

  return `${appOrigin}/${hash}`;
}
