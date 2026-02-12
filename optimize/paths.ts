import { Hono } from "hono";
import { build, type PluginOption } from "vite";
import path from "node:path";

/**
 * Extract route paths from a Hono app instance directly imported in vite.config.ts.
 * Note: This approach will fail if the app's module tree uses Vite-specific features
 * (e.g. virtual modules) since vite.config.ts is loaded before the
 * Vite plugin pipeline is available.
 */
export function getPathsFromDirectImport(app: Hono) {
  return app.routes.map((route) => route.path);
}

/**
 * Build the entry file via Vite and import the output to extract route paths.
 * Unlike `getPathsFromDirectImport`, this runs a full Vite build so
 * Vite-specific features (virtual modules, etc.) are properly resolved.
 * You may need to pass plugins or other options that mirror your main
 * vite.config.ts so the build can resolve all imports correctly.
 */
export async function buildAndImport({
  entry,
  plugins = [],
}: {
  entry: string;
  plugins?: PluginOption[];
}) {
  const targetFile = path.resolve(entry);
  const outDir = path.resolve(".tmp-optimize");
  await build({
    configFile: false,
    logLevel: "silent",
    build: {
      ssr: targetFile,
      outDir,
      rollupOptions: {
        output: {
          format: "esm",
          entryFileNames: "output.mjs",
        },
      },
      // メインビルドに影響しないように
      emptyOutDir: true,
      copyPublicDir: false,
    },
    plugins,
  });
  const outFile = path.join(outDir, "output.mjs");
  const mod = await import(outFile);
  const app = mod.default;
  if (app instanceof Hono) {
    return app.routes.map((route) => route.path);
  }
  return [];
}
