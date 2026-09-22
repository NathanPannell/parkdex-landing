import { authTokenRedirectTarget } from "./auth-token-redirect";

const target = authTokenRedirectTarget(window.location.origin, window.location.hash);
if (target) window.location.replace(target);
