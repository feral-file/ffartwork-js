import { describe, it, expect } from "vitest";
import { loadLibWith, mockFetchOnce, mockFetchReject } from "./utils";

describe("loadBlockchainInfo()", () => {
  it("emits blockchain-info-ready on success", async () => {
    const lib = await loadLibWith("https://x/?blockchain=tezos&contract=KT1AAA&token_id=123");
    mockFetchOnce({ height: 123 }); // mimic blockchain API response

    const got = new Promise((resolve) => {
      globalThis.window.addEventListener("feralfile:blockchain-info-ready", (e) => resolve(e.detail.height), { once: true });
    });

    lib.loadBlockchainInfo();
    const height = await got;
    expect(height).toBe(123);
  });

  it("emits blockchain-info-request-error on failure", async () => {
    const lib = await loadLibWith("https://x/?blockchain=tezos&contract=KT1AAA&token_id=123");
    mockFetchReject(new Error("boom"));

    const got = new Promise((resolve) => {
      globalThis.window.addEventListener("feralfile:blockchain-info-request-error", (e) => resolve(String(e.detail.error)), { once: true });
    });

    lib.loadBlockchainInfo();
    expect(await got).toMatch(/boom|error/i);
  });
});
