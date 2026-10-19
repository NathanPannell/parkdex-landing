import { KIP_APP_ORIGINS } from "../src/app-origins.js";
import { createFlagsHandler } from "../lib/flags.js";

export const config = { maxDuration: 10 };

// The staging branch reads staging's flags, like the build's app links.
const handle = createFlagsHandler({
  appOrigin: process.env.VERCEL_GIT_COMMIT_REF === "staging" ? KIP_APP_ORIGINS.staging : KIP_APP_ORIGINS.production,
});

export default {
  fetch(request: Request): Promise<Response> {
    return handle(request);
  },
};
