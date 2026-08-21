/**
 * Vercel serverless entry point.
 *
 * Vercel invokes this file for paths matched by `rewrites` in vercel.json
 * (`/api/*`). It loads the pre-bundled serverless handler produced by the
 * `build` script (`dist/api/index.mjs`), which wraps the shared Express app
 * (tRPC router + Clerk/Manus auth) with `serverless-http`.
 *
 * The bundle is kept separate (dist/api) so the frontend `dist/public`
 * output stays lightweight and Vercel serves static assets from the edge.
 */
import { handler } from "../dist/api/index.mjs";
export default handler;
