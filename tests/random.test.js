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
});
