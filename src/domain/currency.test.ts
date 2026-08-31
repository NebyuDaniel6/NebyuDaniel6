import { describe, expect, it } from "vitest";
import { formatMoney } from "./currency";

describe("formatMoney", () => {
  it("formats ETB without a currency symbol prefix", () => {
    expect(formatMoney(1500, "ETB")).toBe("1,500 ETB");
  });
});
