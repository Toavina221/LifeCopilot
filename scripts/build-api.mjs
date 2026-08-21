/**
 * Bundles the serverless API for Vercel.
 *
 * Output: `dist/api/index.mjs` — a single self-contained ESM file that
 * exports the `serverless-http` handler wrapping the shared Express app.
 *
 * On Vercel, `api/index.mjs` re-exports this bundle, and vercel.json routes
 * every `/api/*` request to it. The bundle packages dependencies so the
 * serverless function starts quickly and does not rely on `pnpm install`
 * at deploy time.
 */
import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["server/vercel.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  outfile: "dist/api/index.mjs",
  sourcemap: false,
  // Bundle everything (including node_modules) into one file.
  packages: "bundle",
  // node builtins are not bundled; keep them external.
  banner: {
    js: [
      "import { createRequire as __vercel_createRequire } from 'module';",
      "import { fileURLToPath as __vercel_fileURLToPath } from 'url';",
      "import { dirname as __vercel_dirname } from 'path';",
      "globalThis.require = globalThis.require ?? __vercel_createRequire(import.meta.url);",
      "globalThis.__filename = globalThis.__filename ?? __vercel_fileURLToPath(import.meta.url);",
      "globalThis.__dirname = globalThis.__dirname ?? __vercel_dirname(globalThis.__filename);",
    ].join("\n"),
  },
});

console.log("[build:api] dist/api/index.mjs written");
