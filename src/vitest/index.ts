import { configDefaults, defineConfig, type ViteUserConfig } from "vitest/config";

const baseTestConfig = {
  allowOnly: false,
  clearMocks: true,
  exclude: [...configDefaults.exclude, "**/.next/**", "**/.output/**", "**/.turbo/**"],
  globals: false,
  hookTimeout: 10_000,
  include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  passWithNoTests: false,
  restoreMocks: true,
  testTimeout: 10_000,
  unstubEnvs: true,
  unstubGlobals: true,
  coverage: {
    enabled: false,
    exclude: [
      "**/*.d.ts",
      "**/*.{config,conf}.{js,cjs,mjs,ts,cts,mts}",
      "**/{fixtures,mocks,test,tests,__tests__}/**",
    ],
    include: ["src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    provider: "v8" as const,
    reporter: ["text", "json", "html", "lcov"],
    reportOnFailure: true,
    thresholds: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export function defineVitestConfig(overrides: ViteUserConfig = {}): ViteUserConfig {
  return defineConfig({
    ...overrides,
    test: {
      ...baseTestConfig,
      ...overrides.test,
      coverage: {
        ...baseTestConfig.coverage,
        ...overrides.test?.coverage,
        thresholds: {
          ...baseTestConfig.coverage.thresholds,
          ...overrides.test?.coverage?.thresholds,
        },
      },
    },
  });
}

export default defineVitestConfig();
