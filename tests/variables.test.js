import { describe, it, expect } from "vitest";
import { loadLibWith } from "./utils";

describe("getVariables()", () => {
  it("parses URL params", async () => {
    const lib = await loadLibWith("https://x/?blockchain=ethereum&contract=0x1AAA&token_id=123&edition_number=2&artwork_number=9");
    expect(lib.getVariables()).toEqual({
      blockchain: "ethereum",
      contract: "0x1AAA",
      tokenID: "123",
      editionNumber: 2,
      artworkNumber: 9,
    });
  });
});
