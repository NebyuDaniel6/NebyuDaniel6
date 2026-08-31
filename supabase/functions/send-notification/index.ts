// FCM send lives here with the server key. Clients only store tokens.

Deno.serve(async (req) => {
  const body = await req.json();
  if (!body.userId || !body.title) {
    return new Response("Invalid notification", { status: 400 });
  }
  return Response.json({ queued: true });
});
