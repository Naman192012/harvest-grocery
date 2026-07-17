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
  // Production is deployed on Vercel (Node runtime), where env vars are exposed
  // via process.env — so we build for the Vercel preset, not the wrapper's
  // Cloudflare default. This is what lets the Airtable server code read
  // AIRTABLE_BASE_ID / AIRTABLE_API_TOKEN directly from process.env at runtime.
  // (On Cloudflare/Lovable those secrets never reach the SSR runtime, which is
  // why this app targets Vercel instead.)
  nitro: {
    preset: "vercel",
  },
});
