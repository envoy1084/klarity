# @envoy1084/config

Production-grade, deliberately opinionated shared configuration for TypeScript projects. The package
keeps compiler, lint, formatting, library build, and commit conventions aligned across applications,
packages, and monorepos without hiding the underlying tools.

## Requirements

- Node.js 22.18 or newer (required for native TypeScript config loading used by Oxlint)
- pnpm 11
- Install only the peer tools you use; all peers are optional so a TSConfig-only consumer stays lean

```sh
pnpm add -D @envoy1084/config typescript
```

The package publishes source config files directly. There is no runtime initialization, generated
state, or install script.

## TypeScript

Create `tsconfig.json` and select exactly one environment preset:

```json
{
  "extends": "@envoy1084/config/tsconfig/library-node",
  "include": ["src", "test"]
}
```

All presets inherit strictness from `base`: strict mode, exact optional properties, unchecked indexed
access, side-effect import checking, isolated modules, forced module detection, consistent casing,
override/return/switch checks, and modern class-field behavior. `skipLibCheck` is enabled because
applications should validate their own boundary, not repeatedly re-check third-party declarations.

| Preset            | Use it for                                    | Resolution and environment                                             |
| ----------------- | --------------------------------------------- | ---------------------------------------------------------------------- |
| `base`            | Building a custom preset                      | Strictness only; deliberately no module, target, or lib                |
| `app`             | Browser apps built by a bundler               | ESNext + Bundler, DOM, no emit                                         |
| `vite`            | Vite React apps                               | `app` + React JSX, `vite/client`, TS extension imports                 |
| `next`            | Next.js App or Pages Router                   | Next plugin, preserved JSX, incremental checking, Next-generated types |
| `node`            | Node services, CLIs, workers                  | NodeNext resolution, Node types, no emit                               |
| `bun`             | Bun apps/scripts                              | Preserve + Bundler, Bun types, ESNext target                           |
| `react-native`    | React Native apps                             | React JSX, platform suffix resolution, no DOM globals                  |
| `library`         | Runtime-neutral published libraries           | Bundler resolution, declarations modeled, no environment globals       |
| `library-browser` | Browser-only published libraries              | `library` + DOM and iterable DOM APIs                                  |
| `library-node`    | Node-only published libraries                 | NodeNext resolution and Node globals                                   |
| `library-react`   | Published React component libraries           | Browser library + automatic JSX runtime                                |
| `test`            | Test-only projects or referenced test configs | Preserve modules + Bundler; add your runner's types explicitly         |

Presets use `noEmit` because tsdown/framework bundlers own output. Override it only when `tsc` is the
actual emitter. Add tool globals locally rather than making them leak into every project:

```json
{
  "extends": "@envoy1084/config/tsconfig/test",
  "compilerOptions": { "types": ["vitest/globals", "node"] },
  "include": ["**/*.test.ts"]
}
```

For a project-reference monorepo, keep a root solution config with `files: []` and references, then
extend the appropriate preset inside each package. Set `composite: true` in referenced packages.

## Oxlint

Install `oxlint`, then create the required `oxlint.config.ts`:

```sh
pnpm add -D oxlint
```

```ts
import config from "@envoy1084/config/oxlint/react";
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
export { default } from "@envoy1084/config/oxfmt";
```

The default is 100 columns, 2 spaces, LF, semicolons, single quotes in JS/TS, trailing commas, sorted
imports, and sorted `package.json`. Use `@envoy1084/config/oxfmt/compact` for an 80-column house style.
Because Oxfmt uses the nearest config and does not support shared-package imports from JSON config,
the JavaScript bridge is required. Extend normally when necessary:

```js
import base from "@envoy1084/config/oxfmt";
export default { ...base, printWidth: 120 };
```

Use `oxfmt --write .` locally and `oxfmt --check .` in CI. Generated output, dependency folders,
coverage, framework caches, and the pnpm lockfile are ignored.

## tsdown

Install `tsdown`, select the runtime, and keep package-specific facts beside the package:

```ts
import defineConfig from "@envoy1084/config/tsdown/react";

export default defineConfig({
  entry: { index: "src/index.ts", button: "src/button.tsx" },
});
```

| Factory          | Platform | Default entry  | Notes                                                           |
| ---------------- | -------- | -------------- | --------------------------------------------------------------- |
| `tsdown/library` | neutral  | `src/index.ts` | Universal packages; dependencies should expose modern `exports` |
| `tsdown/node`    | node     | `src/index.ts` | Node 20 target; ESM output                                      |
| `tsdown/browser` | browser  | `src/index.ts` | ES2022 target; ESM output                                       |
| `tsdown/react`   | browser  | `src/index.ts` | React, React DOM, and JSX runtime externalized                  |

All factories clean `dist`, generate declarations and declaration maps, generate package exports,
emit sourcemaps, treeshake, provide ESM shims, fail on warnings, and run publint. Builds stay readable
(`minify: false`) because consumers' application bundlers perform final minification. Override any
field in the factory argument. Keep React in `peerDependencies`, and review generated `exports` before
the first publish. Use a second explicit build configuration if you truly need CommonJS; dual-package
output increases conditional-export and module-state risk and is not the default.

## Commitlint

Install the two Commitlint peers and create `commitlint.config.js`:

```js
export { default } from "@envoy1084/config/commitlint";
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

## Releases and CI

Every user-visible pull request should run `pnpm changeset`, select patch/minor/major, and commit the
generated Markdown file. CI runs formatting, linting, package type-checking, packed-consumer tests, and
a package pack check. On `main`, Changesets maintains a release PR. Merging it publishes to npm with
provenance and creates the GitHub release.

Repository setup:

1. Add an `NPM_TOKEN` Actions secret with publish access to `@envoy1084/config` (unless your npm trusted
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
- Consumer validation installs the packed tarball in a fresh temporary project and invokes the real
  TypeScript, Oxlint, Oxfmt, Commitlint, and tsdown CLIs.

## License

MIT
