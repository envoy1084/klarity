import type { ViteUserConfig } from "vitest/config";

import { defineVitestConfig } from "./index.ts";

export default function defineReactVitestConfig(overrides: ViteUserConfig = {}): ViteUserConfig {
  return defineVitestConfig({
    ...overrides,
    test: { css: true, environment: "jsdom", ...overrides.test },
  });
}
