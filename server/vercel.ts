/**
 * Vercel serverless entry point.
 *
 * Reuses the same Express app defined in `_core/index.ts` (tRPC router, auth
 * context, static file serving) and wraps it with `serverless-http` so Vercel
 * can invoke it as a single serverless function handling `/api/*`.
 */
import serverless from "serverless-http";
import { createApp } from "./app";

const app = createApp();

export const handler = serverless(app, {
  // Vercel invokes this function for every path matched by vercel.json
  // rewrites. Static assets are served by Vercel's edge directly; only API
  // calls and the SPA fallback reach this function.
  request: (req: any) => {
    // Normalize Vercel's URL handling (no double-slash on root).
    if (req.url === "//") req.url = "/";
  },
});
