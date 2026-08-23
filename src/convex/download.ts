import { httpAction } from "./_generated/server";

// Serve the pre-built static archive (v2)
export const downloadZip = httpAction(async (_ctx, _req) => {
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/agglayer-yield-ai.tar.gz",
      "Access-Control-Allow-Origin": "*",
    },
  });
});