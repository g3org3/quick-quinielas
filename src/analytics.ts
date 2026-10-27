import posthog from "posthog-js";

export type EventData = Record<
  string,
  string | number | boolean | null | undefined
>;

declare global {
  interface Window {
    umami?: {
      track: (event?: string, data?: EventData) => void;
      identify: (data?: EventData) => void;
    };
  }
}

/**
 * Captures a product event with every analytics provider.
 *
 * Currently fans out to PostHog and Umami (no-op when the Umami script
 * has not loaded, e.g. blocked or in tests).
 */
export function captureEvent(event: string, data?: EventData): void {
  posthog.capture(event, data);
  if (typeof window === "undefined") return;
  window.umami?.track(event, data);
}

/**
 * Associates identity data with the current visitor on every provider.
 */
export function identifyUser(userId: string, data?: EventData): void {
  posthog.identify(userId, data);
  if (typeof window === "undefined") return;
  window.umami?.identify({ user_id: userId, ...data });
}
