import { describe, it, expect, vi } from "vitest";
import { loadLibWith, mockFetchOnce, mockFetchReject } from "./utils";

describe("loadProvenance()", () => {
  it("emits provenance-ready on success", async () => {
    const lib = await loadLibWith("https://x/?blockchain=tezos&contract=KT1AAA&token_id=123");
    mockFetchOnce([{ provenance: [{ owner: "tz1...", tx: "0xabc" }] }]); // mimic indexer array

    const got = new Promise((resolve) => {
      globalThis.window.addEventListener("feralfile:provenance-ready", (e) => resolve(e.detail.provenances), { once: true });
    });

    lib.loadProvenance();
    const items = await got;
    expect(Array.isArray(items)).toBe(true);
    expect(items[0]).toHaveProperty("owner");
  });

  it("emits provenance-request-error on failure", async () => {
    const lib = await loadLibWith("https://x/?blockchain=tezos&contract=KT1AAA&token_id=123");
    mockFetchReject(new Error("boom"));

    const got = new Promise((resolve) => {
      globalThis.window.addEventListener("feralfile:provenance-request-error", (e) => resolve(String(e.detail.error)), { once: true });
    });

    lib.loadProvenance();
    expect(await got).toMatch(/boom|error/i);
  });

  it("handles invalid blockchain type in alias function", async () => {
    // Test unknown blockchain defaults to 'eth'
    const lib = await loadLibWith("https://x/?blockchain=unknown&contract=0x123&token_id=456");

    // Mock empty response to trigger "token not found" error
    mockFetchOnce([]);

    const gotError = new Promise((resolve) => {
      globalThis.window.addEventListener("feralfile:provenance-request-error", (e) => resolve(e.detail.error.message), { once: true });
    });

    lib.loadProvenance();
    const error = await gotError;
    expect(error).toBe("token not found");
  });

  it("handles ethereum blockchain type explicitly", async () => {
    const lib = await loadLibWith("https://x/?blockchain=ethereum&contract=0x123&token_id=456");

    // Mock successful response 
    mockFetchOnce([{ provenance: ["test"] }]);

    const gotSuccess = new Promise((resolve) => {
      globalThis.window.addEventListener("feralfile:provenance-ready", (e) => resolve(e.detail.provenances), { once: true });
    });

    lib.loadProvenance();
    const result = await gotSuccess;
    expect(result).toEqual(["test"]);
  });

  it("handles missing blockchain parameter error", async () => {
    const lib2 = await loadLibWith("https://x/?token_id=456");
    // Missing contract and blockchain

    const gotError = new Promise((resolve) => {
      globalThis.window.addEventListener("feralfile:provenance-request-error", (e) => resolve(e.detail.error.message), { once: true });
    });

    lib2.loadProvenance();
    const error = await gotError;
    expect(error).toBe("Cannot load provenance: missing blockchain, contract, or tokenID");
  });

  it("handles empty provenance response", async () => {
    const lib = await loadLibWith("https://x/?blockchain=tezos&contract=KT1AAA&token_id=123");

    // Mock empty array response
    mockFetchOnce([]);

    const gotError = new Promise((resolve) => {
      globalThis.window.addEventListener("feralfile:provenance-request-error", (e) => resolve(e.detail.error.message), { once: true });
    });

    lib.loadProvenance();
    const error = await gotError;
    expect(error).toBe("token not found");
  });

  it("handles invalid JSON response", async () => {
    const lib = await loadLibWith("https://x/?blockchain=tezos&contract=KT1AAA&token_id=123");

    // Mock XHR that returns invalid JSON
    const mockXHR = {
      open: vi.fn(),
      send: vi.fn(),
      setRequestHeader: vi.fn(),
      readyState: 4,
      status: 200,
      responseText: "invalid json{",
      onreadystatechange: null,
      onerror: null
    };

    globalThis.XMLHttpRequest = vi.fn(() => {
      setTimeout(() => mockXHR.onreadystatechange?.(), 0);
      return mockXHR;
    });

    const gotError = new Promise((resolve) => {
      globalThis.window.addEventListener("feralfile:provenance-request-error", (e) => resolve(e.detail.error.message), { once: true });
    });

    lib.loadProvenance();
    const error = await gotError;
    expect(error).toBe("Invalid JSON response");
  });

  it("handles HTTP error status", async () => {
    const lib = await loadLibWith("https://x/?blockchain=tezos&contract=KT1AAA&token_id=123");

    // Mock XHR that returns 404 status
    const mockXHR = {
      open: vi.fn(),
      send: vi.fn(),
      setRequestHeader: vi.fn(),
      readyState: 4,
      status: 404,
      responseText: "",
      onreadystatechange: null,
      onerror: null
    };

    globalThis.XMLHttpRequest = vi.fn(() => {
      setTimeout(() => mockXHR.onreadystatechange?.(), 0);
      return mockXHR;
    });

    const gotError = new Promise((resolve) => {
      globalThis.window.addEventListener("feralfile:provenance-request-error", (e) => resolve(e.detail.error.message), { once: true });
    });

    lib.loadProvenance();
    const error = await gotError;
    expect(error).toBe("response is not ok. status: 404");
  });
});
