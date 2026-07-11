import type { ViteUserConfig } from "vitest/config";

import { defineVitestConfig } from "./index.ts";

export default function defineNodeVitestConfig(overrides: ViteUserConfig = {}): ViteUserConfig {
  return defineVitestConfig({
    ...overrides,
    test: { environment: "node", ...overrides.test },
  });
}
