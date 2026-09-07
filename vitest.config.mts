import { defineConfig } from "vitest/config";

// e2e/ é Playwright, não vitest.
export default defineConfig({
  test: {
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
  },
});
