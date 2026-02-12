import type { Plugin } from "vite";

export default function virtualConfig(): Plugin {
  const virtualModuleId = "virtual:app-config";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: "virtual-config",
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const appName = "my-hono-app";
export const version = "1.0.0";`;
      }
    },
  };
}
