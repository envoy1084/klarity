const shared = {
  clean: true,
  dts: { sourcemap: true },
  exports: true,
  failOnWarn: true,
  fixedExtension: false,
  minify: false,
  outDir: 'dist',
  publint: true,
  report: false,
  shims: true,
  sourcemap: true,
  treeshake: true,
};

/** @param {import('tsdown').UserConfig} [overrides] */
export function defineLibraryConfig(overrides = {}) {
  return { ...shared, entry: ['src/index.ts'], format: ['esm'], platform: 'neutral', ...overrides };
}

/** @param {import('tsdown').UserConfig} [overrides] */
export function defineNodeConfig(overrides = {}) {
  return {
    ...shared,
    entry: ['src/index.ts'],
    format: ['esm'],
    platform: 'node',
    target: 'node20',
    ...overrides,
  };
}

/** @param {import('tsdown').UserConfig} [overrides] */
export function defineBrowserConfig(overrides = {}) {
  return {
    ...shared,
    entry: ['src/index.ts'],
    format: ['esm'],
    platform: 'browser',
    target: 'es2022',
    ...overrides,
  };
}

/** @param {import('tsdown').UserConfig} [overrides] */
export function defineReactConfig(overrides = {}) {
  return defineBrowserConfig({
    deps: { neverBundle: ['react', 'react-dom', 'react/jsx-runtime'] },
    ...overrides,
  });
}

export default defineLibraryConfig;
