import type { defineConfig } from "astro/config";

export type AstroConfig = Parameters<typeof defineConfig>[0];

const productionDefaults = {
  build: {
    concurrency: 1,
    inlineStylesheets: "auto" as const,
  },
  compressHTML: "jsx" as const,
  prerenderConflictBehavior: "error" as const,
  security: {
    actionBodySizeLimit: 1_048_576,
    checkOrigin: true,
    serverIslandBodySizeLimit: 1_048_576,
  },
} satisfies AstroConfig;

/**
 * Creates a production-oriented Astro configuration while preserving
 * project-owned deployment, integration, adapter, and Vite settings.
 */
export function defineAstroConfig(overrides: AstroConfig = {}): AstroConfig {
  return {
    ...productionDefaults,
    ...overrides,
    build: {
      ...productionDefaults.build,
      ...overrides.build,
    },
    security: {
      ...productionDefaults.security,
      ...overrides.security,
    },
  } satisfies AstroConfig;
}

export const astroConfig: AstroConfig = defineAstroConfig();

export default defineAstroConfig;
