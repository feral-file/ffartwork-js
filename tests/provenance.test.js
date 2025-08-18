import { describe, it, expect } from "vitest";
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
});
