# klarity

Production-grade, deliberately opinionated shared configuration for TypeScript projects. The package
keeps compiler, lint, formatting, library build, and commit conventions aligned across applications,
packages, and monorepos without hiding the underlying tools.

## Requirements

- Node.js 22.18 or newer (required for native TypeScript config loading used by Oxlint)
- pnpm 11
- Install only the peer tools you use; all peers are optional so a TSConfig-only consumer stays lean

```sh
pnpm add -D klarity typescript
```

Every authored runtime config lives as TypeScript under `src/`. The package compiles those files to
typed ESM before packing because Node does not strip TypeScript inside `node_modules`; package exports
therefore resolve to executable JavaScript plus declarations. Native TSConfig JSON presets are
exported directly from `src/`. There is no runtime initialization, generated state, or install script.

## TypeScript

Create `tsconfig.json` and select exactly one environment preset:

```json
{
  "extends": "klarity/tsconfig/library/node",
  "include": ["src", "test"]
}
```

All presets inherit strictness from `base`: strict mode, exact optional properties, unchecked indexed
access, side-effect import checking, isolated modules, forced module detection, consistent casing,
override/return/switch checks, and modern class-field behavior. `skipLibCheck` is enabled because
applications should validate their own boundary, not repeatedly re-check third-party declarations.

| Export path                 | Use it for                          | Resolution and environment                                        |
| --------------------------- | ----------------------------------- | ----------------------------------------------------------------- |
| `tsconfig/base`             | Building a custom preset            | Strictness only; deliberately no module, target, or lib           |
| `tsconfig/app`              | Browser apps built by a bundler     | ESNext + Bundler, DOM, no emit                                    |
| `tsconfig/app/vite`         | Vite and TanStack Router apps       | App + React JSX, `vite/client`, TS extension imports              |
| `tsconfig/app/next`         | Next.js App or Pages Router         | Next plugin, preserved JSX, incremental checking, generated types |
| `tsconfig/app/node`         | Node services, CLIs, workers        | NodeNext resolution, Node types, no emit                          |
| `tsconfig/app/bun`          | Bun apps and scripts                | Preserve + Bundler, Bun types, ESNext target                      |
| `tsconfig/app/react-native` | React Native apps                   | React JSX, platform suffix resolution, no DOM globals             |
| `tsconfig/library`          | Runtime-neutral published libraries | Bundler resolution, declarations modeled, no environment globals  |
| `tsconfig/library/browser`  | Browser-only packages               | Library + DOM and iterable DOM APIs                               |
| `tsconfig/library/node`     | Node-only packages                  | NodeNext resolution and Node globals                              |
| `tsconfig/library/react`    | React component packages            | Browser library + automatic JSX runtime                           |
| `tsconfig/test`             | Test-only referenced configs        | Preserve modules + Bundler; add runner types explicitly           |

Presets use `noEmit` because tsdown/framework bundlers own output. Override it only when `tsc` is the
actual emitter. Add tool globals locally rather than making them leak into every project:

```json
{
  "extends": "klarity/tsconfig/test",
  "compilerOptions": { "types": ["vitest/globals", "node"] },
  "include": ["**/*.test.ts"]
}
```

For a project-reference monorepo, keep a root solution config with `files: []` and references, then
extend the appropriate preset inside each package. Set `composite: true` in referenced packages.

Next.js needs project-relative file patterns in the consumer config (shared `include` paths would
otherwise resolve inside this package):

```json
{
  "extends": "klarity/tsconfig/app/next",
  "compilerOptions": { "paths": { "@/*": ["./src/*"] } },
  "include": [
    "next-env.d.ts",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.ts",
    "**/*.tsx",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

## Oxlint

Install `oxlint`, then create the required `oxlint.config.ts`:

```sh
pnpm add -D oxlint
```

```ts
import config from "klarity/oxlint/react";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [config],
  rules: { "no-console": "error" },
});
```

Choose `oxlint` (universal), `oxlint/node`, `oxlint/react`, or `oxlint/next`. The base policy elevates
correctness and suspicious findings to errors, keeps performance findings visible as warnings, and
enables native TypeScript, import, promise, Node, Unicorn, and Oxc rules. React adds hooks,
accessibility, and allocation-performance checks; Next adds framework correctness rules. Tests,
declarations, and config/scripts receive narrow overrides.

Recommended scripts:

```json
{
  "scripts": {
    "lint": "oxlint --deny-warnings .",
    "lint:fix": "oxlint --fix ."
  }
}
```

Warnings are intentional migration pressure. CI uses `--deny-warnings`; teams can run plain `oxlint`
while adopting a preset. Enable Oxlint's type-aware mode locally only after measuring it on your repo:
`oxlint --type-aware`. Experimental type-checking is not baked into a shared default.

## Oxfmt

Install `oxfmt` and create `oxfmt.config.ts`:

```js
export { default } from "klarity/oxfmt";
```

The default is 100 columns, 2 spaces, LF, semicolons, **double quotes everywhere**, trailing commas,
sorted imports, and sorted `package.json`. Imports are grouped in this order: Node built-ins, React,
Next.js, TanStack, Effect (`effect` and `@effect/*`), other packages, internal aliases, relative files,
styles, and type imports. Use `klarity/oxfmt/compact` for an 80-column house style. Because
Oxfmt uses the nearest config and does not support shared-package imports from JSON config, the
TypeScript bridge is required. Extend normally when necessary:

```js
import base from "klarity/oxfmt";
export default { ...base, printWidth: 120 };
```

Use `oxfmt --write .` locally and `oxfmt --check .` in CI. Generated output, dependency folders,
coverage, framework caches, and the pnpm lockfile are ignored.

## tsdown

Install `tsdown` and `publint`, select the runtime, and keep package-specific facts beside the package:

```sh
pnpm add -D tsdown publint
```

```ts
import defineConfig from "klarity/tsdown/react";

export default defineConfig({
  entry: { index: "src/index.ts", button: "src/button.tsx" },
});
```

| Factory          | Platform | Default entry   | Notes                                                           |
| ---------------- | -------- | --------------- | --------------------------------------------------------------- |
| `tsdown/library` | neutral  | `src/index.ts`  | Universal packages; dependencies should expose modern `exports` |
| `tsdown/node`    | node     | `src/index.ts`  | Node 20 target; ESM output                                      |
| `tsdown/browser` | browser  | `src/index.ts`  | ES2022 target; ESM output                                       |
| `tsdown/react`   | browser  | `src/index.tsx` | React, React DOM, and JSX runtime externalized                  |

All factories clean `dist`, generate declarations and declaration maps, generate package exports,
emit sourcemaps, treeshake, provide ESM shims, fail on warnings, and run publint. Builds stay readable
(`minify: false`) because consumers' application bundlers perform final minification. Override any
field in the factory argument. Keep React in `peerDependencies`, and review generated `exports` before
the first publish. Use a second explicit build configuration if you truly need CommonJS; dual-package
output increases conditional-export and module-state risk and is not the default.

## Commitlint

Install the two Commitlint peers and create `commitlint.config.ts`:

```sh
pnpm add -D @commitlint/cli @commitlint/config-conventional
```

```ts
export { default } from "klarity/commitlint";
```

The preset follows Conventional Commits, uses kebab-case scopes, caps headers/body/footer lines at 100
characters, and requires blank lines before bodies and footers. Examples:

```text
feat(tsconfig): add Bun application preset
fix(oxlint): allow test-only assertions
chore(release): publish package
```

Hook it with the Git hook manager of your choice:

```sh
pnpm exec commitlint --edit "$1"
```

Breaking changes use `!` or a `BREAKING CHANGE:` footer. The standard types include `build`, `chore`,
`ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, and `test`.

The optional `(scope)` segment accepts any kebab-case value by default. To restrict scopes, add custom
types, or override individual rules, use the typed factory:

```ts
import { defineCommitlintConfig } from "klarity/commitlint";

export default defineCommitlintConfig({
  types: ["deps", "release"],
  scopes: ["app", "api", "config", "docs"],
  rules: {
    "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
  },
});
```

`types` are appended to the standard set rather than replacing it. Import `conventionalTypes` or the
`ConventionalType` type from `klarity/commitlint/types` when building other commit tooling.

## Vitest

Install Vitest and the V8 coverage provider:

```sh
pnpm add -D vitest @vitest/coverage-v8
```

For a general TypeScript project, create `vitest.config.ts`:

```ts
export { default } from "klarity/vitest";
```

The base preset uses explicit Vitest imports instead of globals, restores mocks and environment/global
stubs between tests, rejects `.only`, applies ten-second test and hook timeouts, and excludes generated
framework/build directories. Coverage is opt-in and uses V8 with text, JSON, HTML, and LCOV reports.
When enabled, it includes all source files and enforces 80% branches, functions, lines, and statements.

Use the Node factory when you need project-specific overrides:

```ts
import defineConfig from "klarity/vitest/node";

export default defineConfig({
  test: {
    setupFiles: ["./test/setup.ts"],
  },
});
```

For React component tests, install `jsdom` and use the React factory:

```sh
pnpm add -D jsdom @testing-library/react
```

```ts
import defineConfig from "klarity/vitest/react";

export default defineConfig({
  test: {
    setupFiles: ["./test/setup.ts"],
  },
});
```

The React preset enables the `jsdom` environment and CSS processing. Suggested scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

Override `test.coverage.thresholds` locally for stricter packages; threshold fields are deeply merged
with the defaults rather than replacing the entire coverage policy.

## Turborepo

Install Turbo at the workspace root:

```sh
pnpm add -D turbo
```

Turbo does not load npm-exported JavaScript configuration and only supports repository-local
`turbo.json`. Copy the closest schema-validated preset, then customize it in the repository:

```sh
# Mixed applications and packages
cp "$(node -p "require.resolve('klarity/turbo')")" turbo.json

# A monorepo containing Next.js applications
cp "$(node -p "require.resolve('klarity/turbo/next')")" turbo.json

# A publishable-library monorepo
cp "$(node -p "require.resolve('klarity/turbo/library')")" turbo.json
```

The presets provide production caching behavior for `build`, `lint`, `typecheck`, `test`, `dev`,
`test:watch`, and `clean`. Builds run after dependency builds; type-checking follows workspace topology;
coverage and framework outputs are cached; development/watch processes are persistent and never
cached. The Next preset excludes `.next/cache` while caching the remaining production output.

Add application-specific environment variables to the relevant task's `env` array. Do not put every
environment variable in `globalEnv`, because doing so invalidates unrelated workspace caches.

Recommended root scripts:

```json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck"
  }
}
```

## Lefthook

Install the binary and Commitlint peers:

```sh
pnpm add -D lefthook @commitlint/cli @commitlint/config-conventional
```

For a single-package repository, create `lefthook.yml`:

```yaml
extends:
  - node_modules/klarity/src/lefthook/base.yml
```

For a Turborepo monorepo:

```yaml
extends:
  - node_modules/klarity/src/lefthook/monorepo.yml
```

Then install the hooks:

```sh
pnpm exec lefthook install
```

The pre-commit hook formats staged supported files, stages formatter changes, and runs Oxlint on staged
JavaScript/TypeScript. The commit-message hook enforces Klarity's Conventional Commit policy. Before a
push, the single-package preset runs available type-check and test scripts in parallel; the monorepo
preset runs `lint`, `typecheck`, and `test` through Turbo.

Named Lefthook jobs merge cleanly. Override a job with the same `name` in your local `lefthook.yml`, or
add repository-specific jobs without forking the shared preset.

## Releases and CI

Every user-visible pull request should run `pnpm changeset`, select patch/minor/major, and commit the
generated Markdown file. CI runs formatting, linting, package type-checking, and a package pack check.
On `main`, Changesets maintains a release PR. Merging it publishes to npm with
provenance and creates the GitHub release.

Repository setup:

1. Add an `NPM_TOKEN` Actions secret with publish access to `klarity` (unless your npm trusted
   publishing setup removes the token requirement).
2. Allow GitHub Actions to create pull requests in repository Actions settings.
3. Protect `main` and require the CI check.
4. Ensure the npm scope/package is public and that the first publish is authorized.

Commands for maintainers:

```sh
pnpm install
pnpm check
pnpm changeset
pnpm pack:check
```

## Design principles

- Environment presets never silently inject unrelated globals.
- Framework compilers own emit; TypeScript owns correctness.
- Published libraries default to ESM and explicit runtime targeting.
- Stable correctness rules are errors; subjective or adoption-sensitive rules are warnings/off.
- Release validation is performed against the packed tarball in disposable real framework projects,
  never through package-internal test imports.

## License

MIT
