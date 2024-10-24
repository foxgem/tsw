import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
  outDir: "dist",
  manifest: {
    permissions: ["contextMenus", "tabs", "storage", "alarms", "activeTab"],
    background: {
      service_worker: "background.ts",
    },
    name: "tsw - tiny smart worker",
    description: "Your tiny smart worker",
    version: "0.2.0",
    host_permissions: ["https://*/*"],
    icons: {
      16: "/icon.png",
      32: "/icon.png",
      48: "/icon.png",
      128: "/icon.png",
    },
  },
});
