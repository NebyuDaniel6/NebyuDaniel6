// Server-only. Verify providers here. Never trust the client for payment success.

Deno.serve(async (req) => {
  const body = await req.json();
  if (!body.orderId || !body.amountEtb || !body.provider) {
    return new Response("Invalid intent", { status: 400 });
  }

  return Response.json({
    status: "processing",
    providerRef: `${body.provider}_${body.orderId}`,
  });
});
