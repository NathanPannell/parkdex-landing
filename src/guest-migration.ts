export const MIGRATION_APP_BY_LANDING_ORIGIN = {
  "https://parkdex.app": "https://web.parkdex.app",
  "https://staging.parkdex.app": "https://staging.web.parkdex.app",
} as const;

export const GUEST_PROGRESS_KEYS = [
  "every-park:collection-key:v1",
  "every-park:visited:v1",
  "every-park:visit-timestamps:v1",
  "every-park:visit-metadata:v1",
  "every-park:trails:v1",
  "every-park:pending:v1",
  "every-park:trail-pending:v1",
  "every-park:guest-revision:v1",
] as const;

export const MAX_GUEST_TRANSFER_BYTES = 256 * 1024;

const READY_TYPE = "parkdex-guest-migration-ready";
const TRANSFER_TYPE = "parkdex-guest-migration-transfer";
const RESULT_TYPE = "parkdex-guest-migration-result";
const RESULT_STATUSES = ["imported", "conflict", "invalid", "oversized", "storage-error"] as const;
const MIGRATION_TIMEOUT_MS = 120_000;
const POPUP_CLOSE_POLL_MS = 500;

export type GuestProgressKey = (typeof GUEST_PROGRESS_KEYS)[number];
export type GuestProgressValues = Partial<Record<GuestProgressKey, string>>;
export type GuestMigrationTransfer = {
  type: typeof TRANSFER_TYPE;
  version: 1;
  values: GuestProgressValues;
};
export type GuestMigrationStatus = (typeof RESULT_STATUSES)[number];

export interface GuestMigrationStorage {
  getItem(key: string): string | null;
  removeItem(key: string): void;
}

export interface GuestMigrationPopup {
  postMessage(message: GuestMigrationTransfer, targetOrigin: string): void;
  readonly closed: boolean;
}

export interface GuestMigrationEvent {
  origin: string;
  source: unknown;
  data: unknown;
}

export interface GuestMigrationRuntime {
  landingOrigin: string;
  getStorage(): GuestMigrationStorage | null;
  open(url: string, target: "_blank"): GuestMigrationPopup | null;
  subscribe(listener: (event: GuestMigrationEvent) => void): () => void;
  schedule(callback: () => void, delayMs: number): unknown;
  cancel(handle: unknown): void;
}

export function collectGuestProgress(storage: GuestMigrationStorage): GuestProgressValues {
  const values: GuestProgressValues = {};
  for (const key of GUEST_PROGRESS_KEYS) {
    const value = storage.getItem(key);
    if (value !== null) values[key] = value;
  }
  return values;
}

export function hasGuestProgress(values: GuestProgressValues): boolean {
  return Object.values(values).some((value) => typeof value === "string" && value.length > 0);
}

export function createGuestMigrationTransfer(values: GuestProgressValues): GuestMigrationTransfer | null {
  const safeValues: GuestProgressValues = {};
  for (const key of GUEST_PROGRESS_KEYS) {
    const value = values[key];
    if (typeof value === "string") safeValues[key] = value;
  }

  const message: GuestMigrationTransfer = {
    type: TRANSFER_TYPE,
    version: 1,
    values: safeValues,
  };
  if (new TextEncoder().encode(JSON.stringify(message)).byteLength > MAX_GUEST_TRANSFER_BYTES) return null;
  return message;
}

function hasExactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const keys = Object.keys(value);
  return keys.length === expected.length && expected.every((key) => Object.hasOwn(value, key));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isGuestMigrationReady(value: unknown): boolean {
  return isRecord(value)
    && hasExactKeys(value, ["type", "version"])
    && value.type === READY_TYPE
    && value.version === 1;
}

export function guestMigrationResultStatus(value: unknown): GuestMigrationStatus | null {
  if (!isRecord(value)
    || !hasExactKeys(value, ["type", "version", "status"])
    || value.type !== RESULT_TYPE
    || value.version !== 1
    || typeof value.status !== "string"
    || !RESULT_STATUSES.includes(value.status as GuestMigrationStatus)) return null;
  return value.status as GuestMigrationStatus;
}

const STATUS_COPY: Record<GuestMigrationStatus, string> = {
  imported: "Guest progress moved. Continue in the new app tab.",
  conflict: "The new app already has saved progress. Your original progress is still here, so nothing was removed.",
  invalid: "The new app could not verify this saved progress. Your original data is still here.",
  oversized: "This saved progress is too large for the secure transfer. Your original data is still here.",
  "storage-error": "The new app could not save this progress. Your original data is still here.",
};

export function connectGuestMigration(
  panel: HTMLElement,
  button: HTMLButtonElement,
  status: HTMLElement,
  runtime: GuestMigrationRuntime,
): void {
  const appOrigin = MIGRATION_APP_BY_LANDING_ORIGIN[runtime.landingOrigin as keyof typeof MIGRATION_APP_BY_LANDING_ORIGIN];
  if (!appOrigin) return;

  let storage: GuestMigrationStorage | null;
  let initialValues: GuestProgressValues;
  try {
    storage = runtime.getStorage();
    if (!storage) return;
    initialValues = collectGuestProgress(storage);
  } catch {
    return;
  }
  if (!hasGuestProgress(initialValues)) return;

  panel.hidden = false;
  let flowStarted = false;

  button.addEventListener("click", () => {
    if (flowStarted || button.disabled || !storage) return;

    let values: GuestProgressValues;
    try {
      values = collectGuestProgress(storage);
    } catch {
      status.textContent = "This browser could not read the saved progress. The original data remains here.";
      return;
    }
    if (!hasGuestProgress(values)) {
      panel.hidden = true;
      return;
    }

    const transfer = createGuestMigrationTransfer(values);
    if (!transfer) {
      status.textContent = "This saved progress is larger than the secure transfer limit. The original data remains here.";
      return;
    }

    flowStarted = true;
    button.disabled = true;
    let popup: GuestMigrationPopup | null = null;
    let transferSent = false;
    let unsubscribe = () => {};
    let timeoutHandle: unknown = null;
    let closePollHandle: unknown = null;
    let attemptFinished = false;
    const cleanup = () => {
      if (attemptFinished) return;
      attemptFinished = true;
      unsubscribe();
      if (timeoutHandle !== null) runtime.cancel(timeoutHandle);
      if (closePollHandle !== null) runtime.cancel(closePollHandle);
      timeoutHandle = null;
      closePollHandle = null;
    };
    const allowRetry = () => {
      flowStarted = false;
      button.disabled = false;
    };
    const finishWithFailure = (message: string) => {
      if (attemptFinished) return;
      cleanup();
      allowRetry();
      status.textContent = message;
    };
    const handleMessage = (event: GuestMigrationEvent) => {
      if (attemptFinished || !popup || event.origin !== appOrigin || event.source !== popup) return;

      if (!transferSent && isGuestMigrationReady(event.data)) {
        transferSent = true;
        try {
          popup.postMessage(transfer, appOrigin);
          status.textContent = "Sending the saved progress to the new app…";
        } catch {
          finishWithFailure("The transfer could not start. Your original data remains here. Choose Move guest progress to try again.");
        }
        return;
      }

      if (!transferSent) return;
      const result = guestMigrationResultStatus(event.data);
      if (!result) return;
      cleanup();
      status.textContent = STATUS_COPY[result];

      if (result !== "imported") {
        allowRetry();
        return;
      }
      let retained = false;
      for (const [key, sentValue] of Object.entries(transfer.values) as [GuestProgressKey, string][]) {
        try {
          if (storage.getItem(key) === sentValue) storage.removeItem(key);
          else retained = true;
        } catch {
          retained = true;
        }
      }
      if (retained) {
        status.textContent = "The saved progress was moved. Newer changes on this page remain here.";
        allowRetry();
      } else {
        panel.hidden = true;
      }
    };

    try {
      unsubscribe = runtime.subscribe(handleMessage);
      popup = runtime.open(`${appOrigin}/migrate/`, "_blank");
    } catch {
      finishWithFailure("The new app did not open. Your original data remains here. Choose Move guest progress to try again.");
      return;
    }
    if (!popup) {
      finishWithFailure("The new app did not open. Allow pop-ups, then choose Move guest progress again.");
      return;
    }

    status.textContent = "Waiting for the new app to connect…";
    const checkPopup = () => {
      if (attemptFinished || !popup) return;
      let popupClosed = false;
      try {
        popupClosed = popup.closed;
      } catch {
        popupClosed = true;
      }
      if (popupClosed) {
        finishWithFailure("The new app tab closed before progress moved. Your original data is still here. Choose Move guest progress to try again.");
        return;
      }
      try {
        closePollHandle = runtime.schedule(checkPopup, POPUP_CLOSE_POLL_MS);
      } catch {
        finishWithFailure("The transfer could not be monitored. Your original data remains here. Choose Move guest progress to try again.");
      }
    };
    try {
      timeoutHandle = runtime.schedule(
        () => finishWithFailure("The new app did not finish in time. Your original data is still here. Choose Move guest progress to try again."),
        MIGRATION_TIMEOUT_MS,
      );
      closePollHandle = runtime.schedule(checkPopup, POPUP_CLOSE_POLL_MS);
    } catch {
      finishWithFailure("The transfer could not be monitored. Your original data remains here. Choose Move guest progress to try again.");
    }
  });
}

export function browserGuestMigrationRuntime(): GuestMigrationRuntime {
  return {
    landingOrigin: window.location.origin,
    getStorage() {
      try {
        return window.localStorage;
      } catch {
        return null;
      }
    },
    open(url, target) {
      return window.open(url, target);
    },
    subscribe(listener) {
      const handle = (event: MessageEvent) => listener(event);
      window.addEventListener("message", handle);
      return () => window.removeEventListener("message", handle);
    },
    schedule(callback, delayMs) {
      return window.setTimeout(callback, delayMs);
    },
    cancel(handle) {
      window.clearTimeout(handle as number);
    },
  };
}
