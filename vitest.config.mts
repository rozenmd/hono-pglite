import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["./test/setup/global-setup.ts"],
    teardownTimeout: 10000,
    environment: "node",
  },
});
