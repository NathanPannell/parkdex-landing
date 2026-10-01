import { createBadgeCountHandler } from "../lib/badge-count.js";

export const config = { maxDuration: 10 };

const handle = createBadgeCountHandler();

export default {
  fetch(request: Request): Promise<Response> {
    return handle(request);
  },
};
