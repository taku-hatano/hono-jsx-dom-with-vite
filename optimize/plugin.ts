import {
  buildInitParams,
  serializeInitParams,
} from "hono/router/reg-exp-router";
import { type Plugin } from "vite";

/**
 * Vite plugin that optimizes Hono's router by replacing it with a
 * PreparedRegExpRouter pre-built from the given route paths.
 * The `paths` parameter is intentionally decoupled from this plugin so that
 * it can be obtained in different ways (e.g. direct import, separate build).
 * See `paths.ts` for available strategies.
 */
export default function optimize({ paths }: { paths: string[] }): Plugin {
  const preset = "hono";
  const VIRTUAL_HONO_ID = `\0virtual:${preset}`;
  // TODO: Determine the router type dynamically like hono CLI's optimized build
  const serialized = serializeInitParams(
    buildInitParams({
      paths,
    }),
  );
  const importStatement =
    "import { PreparedRegExpRouter } from 'hono/router/reg-exp-router'";
  const assignRouterStatement = `const routerParams = ${serialized}
this.router = new PreparedRegExpRouter(...routerParams)`;
  return {
    name: "optimize-build",
    enforce: "pre",
    apply: "build",
    resolveId(source) {
      if (source === preset) {
        return VIRTUAL_HONO_ID;
      }
    },
    load(id) {
      if (id === VIRTUAL_HONO_ID) {
        return `
import { HonoBase } from 'hono/hono-base'
${importStatement}

export class Hono extends HonoBase {
  constructor(options = {}) {
    super(options)
    ${assignRouterStatement}
  }
}
`;
      }
    },
  };
}
