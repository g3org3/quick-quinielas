import posthog from "posthog-js";
import { pb } from "./pb";

export const API_REQUEST_COMPLETED_EVENT = "api_request_completed";

export type ApiService = "pocketbase" | "netlify";

export interface ApiRequestCompletedProperties {
  duration_ms: number;
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  service: ApiService;
  user_email: string;
}

type Capture = (
  event: typeof API_REQUEST_COMPLETED_EVENT,
  properties: ApiRequestCompletedProperties
) => unknown;

type Fetch = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>;

interface InstrumentedFetchOptions {
  fetchImpl?: Fetch;
  capture?: Capture;
  now?: () => number;
}

const pocketBaseRecordMarker = "records";
const numericSegment = /^\d+$/;
const uuidSegment =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function requestMethod(input: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method) return init.method.toUpperCase();
  if (typeof Request !== "undefined" && input instanceof Request) {
    return input.method.toUpperCase();
  }
  return "GET";
}

function baseUrl(): string {
  return typeof window === "undefined"
    ? "http://localhost"
    : window.location.origin;
}

/** Returns only a low-cardinality path; query strings and fragments are discarded. */
export function normalizeApiEndpoint(input: RequestInfo | URL): string {
  const pathname = new URL(requestUrl(input), baseUrl()).pathname;
  const segments = pathname.split("/");

  return (
    segments
      .map((segment, index) => {
        const followsPocketBaseRecords =
          segments[index - 1] === pocketBaseRecordMarker;
        if (
          segment &&
          (followsPocketBaseRecords ||
            numericSegment.test(segment) ||
            uuidSegment.test(segment))
        ) {
          return ":id";
        }
        return segment;
      })
      .join("/") || "/"
  );
}

function safeNow(now: () => number): number {
  try {
    return now();
  } catch {
    return 0;
  }
}

function capturePostHogEvent(
  event: typeof API_REQUEST_COMPLETED_EVENT,
  properties: ApiRequestCompletedProperties
): void {
  posthog.capture(event, properties);
}

/** Wraps a real network fetch without changing its response or rejection. */
export function createInstrumentedFetch(
  service: ApiService,
  options: InstrumentedFetchOptions = {}
): Fetch {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
  const capture = options.capture ?? capturePostHogEvent;
  const now = options.now ?? (() => performance.now());

  return async (input, init) => {
    const startedAt = safeNow(now);

    const emitCompletion = (response?: Response): void => {
      try {
        const duration = Math.max(0, safeNow(now) - startedAt);
        capture(API_REQUEST_COMPLETED_EVENT, {
          duration_ms: duration,
          endpoint: normalizeApiEndpoint(input),
          method: requestMethod(input, init),
          status: response?.status ?? 0,
          success: response?.ok ?? false,
          service,
          user_email: pb.authStore.model?.email,
        });
      } catch {
        // Analytics must never affect the request result.
      }
    };

    try {
      const response = await fetchImpl(input, init);
      emitCompletion(response);
      return response;
    } catch (error) {
      emitCompletion();
      throw error;
    }
  };
}

export const netlifyFetch = createInstrumentedFetch("netlify");
