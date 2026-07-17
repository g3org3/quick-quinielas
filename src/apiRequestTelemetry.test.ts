import posthog from "posthog-js";
import { describe, expect, it, vi } from "vitest";
import {
  API_REQUEST_COMPLETED_EVENT,
  createInstrumentedFetch,
  normalizeApiEndpoint,
} from "./apiRequestTelemetry";
import { pb } from "./pb";

const propertyKeys = [
  "duration_ms",
  "endpoint",
  "method",
  "service",
  "status",
  "success",
];

describe("normalizeApiEndpoint", () => {
  it("removes query strings and fragments and normalizes dynamic ids", () => {
    expect(
      normalizeApiEndpoint(
        "https://pb.example.com/api/collections/users/records/a1b2c3d4e5f6g7h?filter=email%3D%22secret@example.com%22&token=auth-token#private",
      ),
    ).toBe("/api/collections/users/records/:id");

    expect(
      normalizeApiEndpoint(
        "/.netlify/functions/tournament/123/550e8400-e29b-41d4-a716-446655440000?email=secret@example.com",
      ),
    ).toBe("/.netlify/functions/tournament/:id/:id");
  });
});

describe("PocketBase instrumentation", () => {
  it("times requests sent through the shared PocketBase client", async () => {
    const response = new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    const fetchImpl = vi.fn().mockResolvedValue(response);
    const capture = vi.spyOn(posthog, "capture").mockImplementation(() => undefined);

    await pb.send("/api/health", { fetch: fetchImpl });

    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(capture).toHaveBeenCalledOnce();
    expect(capture).toHaveBeenCalledWith(
      API_REQUEST_COMPLETED_EVENT,
      expect.objectContaining({
        endpoint: "/api/health",
        method: "GET",
        service: "pocketbase",
        status: 200,
        success: true,
      }),
    );
    capture.mockRestore();
  });
});

describe("createInstrumentedFetch", () => {
  it("records duration and exact allowlisted success metadata once", async () => {
    const response = new Response(null, { status: 201 });
    const fetchImpl = vi.fn().mockResolvedValue(response);
    const capture = vi.fn();
    const now = vi.fn().mockReturnValueOnce(100).mockReturnValueOnce(142.5);
    const instrumentedFetch = createInstrumentedFetch("pocketbase", {
      fetchImpl,
      capture,
      now,
    });

    const result = await instrumentedFetch(
      "https://pb.example.com/api/collections/users/records/record-id?filter=password%3Dsecret&token=auth-token#private",
      { method: "post", headers: { Authorization: "Bearer auth-token" } },
    );

    expect(result).toBe(response);
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(capture).toHaveBeenCalledOnce();
    expect(capture).toHaveBeenCalledWith(API_REQUEST_COMPLETED_EVENT, {
      duration_ms: 42.5,
      endpoint: "/api/collections/users/records/:id",
      method: "POST",
      status: 201,
      success: true,
      service: "pocketbase",
    });

    const properties = capture.mock.calls[0][1];
    expect(Object.keys(properties).sort()).toEqual(propertyKeys);
    expect(JSON.stringify(properties)).not.toContain("secret");
    expect(JSON.stringify(properties)).not.toContain("auth-token");
    expect(JSON.stringify(properties)).not.toContain("Authorization");
  });

  it("records non-ok HTTP responses as failures without changing the response", async () => {
    const response = new Response("unavailable", { status: 503 });
    const capture = vi.fn();
    const instrumentedFetch = createInstrumentedFetch("netlify", {
      fetchImpl: vi.fn().mockResolvedValue(response),
      capture,
      now: vi.fn().mockReturnValueOnce(5).mockReturnValueOnce(9),
    });

    const result = await instrumentedFetch("/.netlify/functions/hello");

    expect(result).toBe(response);
    expect(capture).toHaveBeenCalledOnce();
    expect(capture.mock.calls[0][1]).toEqual({
      duration_ms: 4,
      endpoint: "/.netlify/functions/hello",
      method: "GET",
      status: 503,
      success: false,
      service: "netlify",
    });
    expect(Object.keys(capture.mock.calls[0][1]).sort()).toEqual(propertyKeys);
  });

  it("uses the Request method when init does not override it", async () => {
    const capture = vi.fn();
    const instrumentedFetch = createInstrumentedFetch("netlify", {
      fetchImpl: vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
      capture,
      now: () => 10,
    });

    await instrumentedFetch(
      new Request("https://example.com/.netlify/functions/hello", {
        method: "DELETE",
      }),
    );

    expect(capture.mock.calls[0][1].method).toBe("DELETE");
  });

  it("records network failures once with status zero and preserves the error", async () => {
    const networkError = new TypeError("network unavailable");
    const capture = vi.fn();
    const instrumentedFetch = createInstrumentedFetch("pocketbase", {
      fetchImpl: vi.fn().mockRejectedValue(networkError),
      capture,
      now: vi.fn().mockReturnValueOnce(20).mockReturnValueOnce(27),
    });

    await expect(
      instrumentedFetch(
        "https://pb.example.com/api/collections/results/records?filter=user%3Dsecret",
      ),
    ).rejects.toBe(networkError);

    expect(capture).toHaveBeenCalledOnce();
    expect(capture.mock.calls[0][1]).toEqual({
      duration_ms: 7,
      endpoint: "/api/collections/results/records",
      method: "GET",
      status: 0,
      success: false,
      service: "pocketbase",
    });
    expect(Object.keys(capture.mock.calls[0][1]).sort()).toEqual(propertyKeys);
    expect(JSON.stringify(capture.mock.calls[0][1])).not.toContain("secret");
    expect(JSON.stringify(capture.mock.calls[0][1])).not.toContain(
      "network unavailable",
    );
  });

  it("preserves a successful response when PostHog capture throws", async () => {
    const response = new Response("ok");
    const instrumentedFetch = createInstrumentedFetch("netlify", {
      fetchImpl: vi.fn().mockResolvedValue(response),
      capture: vi.fn(() => {
        throw new Error("analytics unavailable");
      }),
      now: () => 1,
    });

    await expect(instrumentedFetch("/.netlify/functions/hello")).resolves.toBe(
      response,
    );
  });

  it("preserves the original network error when PostHog capture throws", async () => {
    const networkError = new Error("original network error");
    const instrumentedFetch = createInstrumentedFetch("pocketbase", {
      fetchImpl: vi.fn().mockRejectedValue(networkError),
      capture: vi.fn(() => {
        throw new Error("analytics unavailable");
      }),
      now: () => 1,
    });

    await expect(
      instrumentedFetch("https://pb.example.com/api/health"),
    ).rejects.toBe(networkError);
  });
});
