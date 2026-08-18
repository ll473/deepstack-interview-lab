import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { cdnAdapter } from "@vinext/cloudflare/cache/cdn-adapter";
import hostingConfig from "./.openai/hosting.json" with { type: "json" };

const { d1 } = hostingConfig;
const localBindingConfig = {
  main: "vinext/server/fetch-handler",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1 ? [{
    binding: d1,
    database_name: "deepstack-user-data",
    database_id: "00000000-0000-4000-8000-000000000000",
  }] : [],
};

export default defineConfig({
  plugins: [
    vinext({
      cache: { cdn: cdnAdapter() },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
      config: localBindingConfig,
    }),
  ],
});
