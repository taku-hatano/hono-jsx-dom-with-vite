# hono-jsx-dom-with-vite

Vite plugin for optimizing Hono's router with `PreparedRegExpRouter` at build time.

This is a PoC project to explore how to implement this optimization as a Vite plugin.

## Architecture

The plugin works in two phases:

1. **Route path extraction** - Collect all route paths registered in the Hono app
2. **Router optimization** - Replace the default router with a `PreparedRegExpRouter` pre-built from the extracted paths

These phases are intentionally separated because extracting route paths is the challenging part. See below for the trade-offs of each approach.

## Route path extraction strategies

### Direct import (`getPathsFromDirectImport`)

Import the Hono app instance directly in `vite.config.ts` and read its routes.

- Simple
- Breaks if the app's module tree uses Vite-specific features (virtual modules, CSS imports, etc.), since `vite.config.ts` is loaded before the Vite plugin pipeline is available

### Build and import (`buildAndImport`)

Run a separate Vite build to bundle the app entry, then dynamically import the output to extract routes.

- Works with Vite-specific features since it runs a full Vite build
- Requires passing relevant plugins/options from `vite.config.ts` to keep the build consistent
- Effectively runs the build twice, which may become a concern for larger projects
