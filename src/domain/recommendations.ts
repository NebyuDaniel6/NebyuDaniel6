import type {
  Bouquet,
  FlowerType,
  Occasion,
  Person,
  RecommendationInput,
  RecommendationReason,
} from "./types";

const COLOR_WORDS = [
  "pink",
  "white",
  "red",
  "yellow",
  "coral",
  "peach",
  "ivory",
  "blush",
  "gold",
];

const FLOWER_WORDS: Record<string, FlowerType> = {
  rose: "roses",
  roses: "roses",
  lily: "lilies",
  lilies: "lilies",
  tulip: "tulips",
  tulips: "tulips",
  sunflower: "sunflowers",
  sunflowers: "sunflowers",
  mixed: "mixed",
  seasonal: "seasonal",
};

const OCCASION_WORDS: Record<string, Occasion> = {
  birthday: "birthday",
  romantic: "romantic",
  love: "i_love_you",
  anniversary: "anniversary",
  congratulations: "congratulations",
  sorry: "apology",
  apology: "apology",
  sympathy: "sympathy",
  thank: "thank_you",
  thinking: "thinking_of_you",
};

export interface ParsedRequest {
  budgetEtb?: number;
  colors: string[];
  flowerTypes: FlowerType[];
  occasion?: Occasion;
  simple?: boolean;
  premium?: boolean;
}

export function parseFlowerRequest(query: string): ParsedRequest {
  const text = query.toLowerCase();
  const colors = COLOR_WORDS.filter((color) => text.includes(color));
  const flowerTypes = Object.entries(FLOWER_WORDS)
    .filter(([word]) => text.includes(word))
    .map(([, type]) => type)
    .filter((type, index, list) => list.indexOf(type) === index);

  const occasionEntry = Object.entries(OCCASION_WORDS).find(([word]) =>
    text.includes(word),
  );

  const budgetMatch = text.match(/(\d[\d,]*)/);
  const budgetEtb = budgetMatch
    ? Number(budgetMatch[1].replace(/,/g, ""))
    : undefined;

  return {
    budgetEtb: Number.isFinite(budgetEtb) ? budgetEtb : undefined,
    colors,
    flowerTypes,
    occasion: occasionEntry?.[1],
    simple: /simple|quiet|minimal/.test(text),
    premium: /premium|luxury|special/.test(text),
  };
}

function available(bouquets: Bouquet[]) {
  return bouquets.filter((bouquet) => bouquet.inventoryStatus !== "out");
}

function scoreBouquet(
  bouquet: Bouquet,
  input: RecommendationInput,
  parsed: ParsedRequest,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  const budget = input.budgetEtb ?? parsed.budgetEtb;
  if (budget) {
    if (bouquet.priceEtb <= budget) {
      score += 8;
      if (bouquet.priceEtb >= budget * 0.7) score += 4;
    } else {
      score -= 20;
    }
  }

  const colors = [
    ...(input.colors ?? []),
    ...(input.person?.favoriteColors ?? []),
    ...parsed.colors,
  ].map((color) => color.toLowerCase());

  if (colors.length > 0) {
    const colorHit = bouquet.colors.some((color) =>
      colors.includes(color.toLowerCase()),
    );
    if (colorHit) {
      score += 12;
      reasons.push("Based on her saved preferences.");
    }
  }

  const types = [
    ...(input.flowerTypes ?? []),
    ...(input.person?.favoriteFlowers ?? []),
    ...parsed.flowerTypes,
  ];
  if (types.includes(bouquet.flowerType)) {
    score += 12;
    if (!reasons.includes("Based on her saved preferences.")) {
      reasons.push("Matches the flowers they love.");
    }
  }

  const occasion = input.occasion ?? parsed.occasion;
  if (occasion && bouquet.occasions.includes(occasion)) {
    score += 10;
    reasons.push("Chosen for this occasion.");
  }

  if (parsed.simple && bouquet.priceEtb < 1300) score += 4;
  if (parsed.premium && bouquet.priceEtb > 2500) score += 6;
  if (bouquet.availableToday) score += 2;
  if (bouquet.inventoryStatus === "low") score -= 1;

  if (reasons.length === 0 && score > 0) {
    reasons.push("From today's available flowers.");
  }

  return { score, reasons };
}

export function recommendBouquets(
  inventory: Bouquet[],
  input: RecommendationInput,
  limit = 3,
): RecommendationReason[] {
  const parsed = input.query ? parseFlowerRequest(input.query) : {
    colors: [],
    flowerTypes: [] as FlowerType[],
  };

  const ranked = available(inventory)
    .map((bouquet) => {
      const { score, reasons } = scoreBouquet(bouquet, input, parsed);
      return { bouquet, score, reasons };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return ranked.map((item) => ({
    bouquetId: item.bouquet.id,
    headline: "We think she'll love this.",
    reason: item.reasons[0] ?? "From today's available flowers.",
  }));
}

export function recommendForPerson(
  inventory: Bouquet[],
  person: Person,
  budgetEtb?: number,
) {
  return recommendBouquets(inventory, {
    person,
    budgetEtb: budgetEtb ?? 2000,
    colors: person.favoriteColors,
    flowerTypes: person.favoriteFlowers,
  });
}
