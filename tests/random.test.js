import { describe, it, expect } from "vitest";
import { loadLibWith } from "./utils";

describe("random()", () => {
  it("deterministic for same seed", async () => {
    const a = await loadLibWith("https://x/?token_id=SEED123");
    const b = await loadLibWith("https://x/?token_id=SEED123");
    expect([a.random(), a.random(), a.random()]).toEqual([b.random(), b.random(), b.random()]);
  });

  it("different for different seeds", async () => {
    const a = await loadLibWith("https://x/?token_id=A");
    const b = await loadLibWith("https://x/?token_id=B");
    expect(a.random()).not.toBe(b.random());
  });

  it("generates random token_id when token_id is not provided", async () => {
    const lib = await loadLibWith("https://x/?blockchain=ethereum&contract=0x123");
    const vars = lib.getVariables();

    // Should have generated a token ID
    expect(vars.tokenID).toBeDefined();
    expect(vars.tokenID).not.toBe("");
    expect(typeof vars.tokenID).toBe("string");
  });
});
