import { describe, expect, it } from "vitest";
import { BOUQUETS } from "../data/seed";
import { parseFlowerRequest, recommendBouquets } from "./recommendations";
import type { Person } from "./types";

const sara: Person = {
  id: "person-sara",
  userId: "user-nebyu",
  name: "Sara",
  relationship: "Wife",
  emoji: "❤️",
  favoriteFlowers: ["roses"],
  favoriteColors: ["pink", "white"],
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("parseFlowerRequest", () => {
  it("extracts color, style, and budget", () => {
    const parsed = parseFlowerRequest("She likes pink and simple flowers. Budget 2,000.");
    expect(parsed.colors).toContain("pink");
    expect(parsed.budgetEtb).toBe(2000);
    expect(parsed.simple).toBe(true);
  });
});

describe("recommendBouquets", () => {
  it("only returns flowers that exist in inventory", () => {
    const results = recommendBouquets(BOUQUETS, {
      query: "She likes pink and simple flowers. Budget 2,000.",
      person: sara,
      occasion: "birthday",
      budgetEtb: 2000,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(3);

    const ids = new Set(BOUQUETS.map((b) => b.id));
    for (const result of results) {
      expect(ids.has(result.bouquetId)).toBe(true);
      const bouquet = BOUQUETS.find((b) => b.id === result.bouquetId);
      expect(bouquet).toBeTruthy();
      expect(bouquet?.inventoryStatus).not.toBe("out");
      expect(bouquet?.priceEtb).toBeLessThanOrEqual(2000);
    }
  });

  it("never invents a bouquet when inventory is empty", () => {
    expect(recommendBouquets([], { query: "red roses", budgetEtb: 5000 })).toEqual([]);
  });
});
