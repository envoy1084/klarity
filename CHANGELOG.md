# klarity

## 0.3.0

### Minor Changes

- [#12](https://github.com/envoy1084/klarity/pull/12) [`40f1814`](https://github.com/envoy1084/klarity/commit/40f18144e0e90eaaf4e267741decbe4b0f9c101c) Thanks [@envoy1084](https://github.com/envoy1084)! - Support TypeScript 7 declaration builds in the tsdown presets by suppressing only
  the declaration generator's known experimental-API warning. Other build warnings
  remain fatal, and consumer overrides still take precedence.

  Raise the minimum tsdown peer to 0.23.0 and extend Vitest and V8 coverage peer
  support to version 5. Add packed-consumer compatibility checks for TypeScript 6/7
  and Vitest 4/5, including declaration maps and strict warning behavior.

## 0.2.0

### Minor Changes

- [`be226f1`](https://github.com/envoy1084/klarity/commit/be226f16ecfa7346a29bb5051095fa5999a21ba8) Thanks [@envoy1084](https://github.com/envoy1084)! - Add a production-oriented, framework-aware TypeScript preset for Astro applications.

## 0.1.0

### Minor Changes

- [`0b271e6`](https://github.com/envoy1084/klarity/commit/0b271e6d23c3e51d1187709dc2cc97f37288b2b8) Thanks [@envoy1084](https://github.com/envoy1084)! - Launch Klarity with production-grade TypeScript, Oxlint, Oxfmt, tsdown, Commitlint, Vitest, Turborepo, and Lefthook presets; intuitive hierarchical exports; typed extension APIs; framework-aware import groups; and release automation.
