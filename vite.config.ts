import pages from "@hono/vite-cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import { defineConfig } from "vite";
import optimize from "./optimize/plugin";
// import app from "./src/index";
import {
  buildAndImport,
  // getPathsFromDirectImport,
} from "./optimize/paths";

import virtualConfig from "./plugins/virtual-config";

export default defineConfig(async ({ mode }) => {
  if (mode === "client") {
    return {
      esbuild: {
        jsxImportSource: "hono/jsx/dom", // Optimized for hono/jsx/dom
      },
      build: {
        rollupOptions: {
          input: "./src/client.tsx",
          output: {
            entryFileNames: "static/client.js",
          },
        },
      },
    };
  } else {
    // const paths = getPathsFromDirectImport(app);
    const paths = await buildAndImport({
      entry: "./src/index.tsx",
      plugins: [virtualConfig()],
    });
    return {
      plugins: [
        virtualConfig(),
        optimize({
          paths,
        }),
        pages(),
        devServer({
          entry: "src/index.tsx",
        }),
      ],
    };
  }
});
