export const KIP_APP_ORIGINS = {
  production: "https://web.parkdex.app",
  staging: "https://staging.web.parkdex.app",
} as const;

export const LANDING_ORIGIN_BY_KIP_APP_ORIGIN: Readonly<Record<string, string>> = {
  [KIP_APP_ORIGINS.production]: "https://parkdex.app",
  [KIP_APP_ORIGINS.staging]: "https://staging.parkdex.app",
};

export const KIP_APP_ORIGIN_BY_LANDING_ORIGIN: Readonly<Record<string, string>> = {
  "https://parkdex.app": KIP_APP_ORIGINS.production,
  "https://staging.parkdex.app": KIP_APP_ORIGINS.staging,
};
