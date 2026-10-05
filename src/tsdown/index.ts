import type { UserConfig } from "tsdown";

const shared = {
  clean: true,
  dts: { sourcemap: true },
  exports: true,
  failOnWarn: true,
  // The tested TS7 generator warns on every build; other warnings must still fail.
  suppressWarnings: [
    /^TypeScript 7\.0 does not yet have a stable API and is experimental\. Some options will be unavailable\.$/,
  ],
  fixedExtension: false,
  minify: false,
  outDir: "dist",
  publint: true,
  report: false,
  shims: true,
  sourcemap: true,
  treeshake: true,
};

export function defineLibraryConfig(overrides: UserConfig = {}): UserConfig {
  return { ...shared, entry: ["src/index.ts"], format: ["esm"], platform: "neutral", ...overrides };
}

export function defineNodeConfig(overrides: UserConfig = {}): UserConfig {
  return {
    ...shared,
    entry: ["src/index.ts"],
    format: ["esm"],
    platform: "node",
    target: "node20",
    ...overrides,
  };
}

export function defineBrowserConfig(overrides: UserConfig = {}): UserConfig {
  return {
    ...shared,
    entry: ["src/index.ts"],
    format: ["esm"],
    platform: "browser",
    target: "es2022",
    ...overrides,
  };
}

export function defineReactConfig(overrides: UserConfig = {}): UserConfig {
  return defineBrowserConfig({
    deps: { neverBundle: ["react", "react-dom", "react/jsx-runtime"] },
    entry: ["src/index.tsx"],
    ...overrides,
  });
}

export default defineLibraryConfig;
