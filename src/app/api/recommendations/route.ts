import { NextResponse } from "next/server";
import { BOUQUETS } from "@/data/seed";
import { recommendBouquets } from "@/domain/recommendations";
import type { RecommendationInput } from "@/domain/types";

export async function POST(request: Request) {
  const input = (await request.json()) as RecommendationInput;
  const available = BOUQUETS.filter((bouquet) => bouquet.inventoryStatus !== "out");
  const results = recommendBouquets(available, input, 3);
  const bouquets = results
    .map((result) => available.find((bouquet) => bouquet.id === result.bouquetId))
    .filter(Boolean);

  return NextResponse.json({
    results,
    bouquets,
  });
}
