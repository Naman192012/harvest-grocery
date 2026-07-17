// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Build target is the wrapper's default (Cloudflare Workers) — this app is
  // served on Lovable's hosting, which runs on Workers. On Workers, env vars
  // are only available inside a request, so every process.env.X read must be
  // deferred to request time (see airtableConfig() in airtable-rest.server.ts
  // and getAirtableClient() in airtable-data.server.ts). A top-level read
  // captures undefined and never recovers.
});
