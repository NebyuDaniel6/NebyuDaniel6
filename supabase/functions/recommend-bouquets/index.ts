import { recommendBouquets } from "../../../src/domain/recommendations.ts";

Deno.serve(async (req) => {
  const input = await req.json();
  const inventory = input.inventory ?? [];
  const results = recommendBouquets(inventory, input, 3);
  return Response.json({ results });
});
