import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./_core/storageProxy";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

/**
 * Shared Express application used by both hosting modes:
 * - Long-lived dev server (`_core/index.ts`) — adds Vite + static serving.
 * - Vercel serverless function (`vercel.ts`) — wrapped with serverless-http.
 *
 * The Clerk/Manus authentication happens in `createContext`, so the API works
 * identically on either host.
 */
export function createApp(): express.Express {
  const app = express();

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Storage proxy (image/media uploads). Safe no-op when Manus storage
  // credentials are not configured (Vercel hosting).
  registerStorageProxy(app);

  // tRPC API — all routes live under /api/trpc.
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  return app;
}
