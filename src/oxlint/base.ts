import { defineConfig } from "oxlint";

const config = defineConfig({
  categories: {
    correctness: "error",
    perf: "warn",
    suspicious: "error",
  },
  plugins: ["eslint", "typescript", "unicorn", "import", "promise", "node", "oxc"],
  env: { builtin: true, es2024: true },
  ignorePatterns: [
    "**/.next/**",
    "**/.output/**",
    "**/.turbo/**",
    "**/build/**",
    "**/coverage/**",
    "**/dist/**",
    "**/node_modules/**",
  ],
  rules: {
    eqeqeq: "error",
    "no-console": "warn",
    "no-debugger": "error",
    "no-else-return": "error",
    "no-eval": "error",
    "no-implicit-coercion": "error",
    "import/no-unassigned-import": "off",
    "no-new-wrappers": "error",
    "no-param-reassign": "error",
    "no-template-curly-in-string": "error",
    "no-throw-literal": "error",
    "no-useless-constructor": "error",
    "object-shorthand": "error",
    "prefer-const": "error",
    "prefer-object-spread": "error",
    "prefer-template": "error",
    "typescript/consistent-type-exports": "error",
    "typescript/consistent-type-imports": ["error", { prefer: "type-imports" }],
    "typescript/no-explicit-any": "warn",
    "typescript/no-non-null-assertion": "warn",
    "typescript/no-require-imports": "error",
    "unicorn/error-message": "error",
    "unicorn/no-array-for-each": "off",
    "unicorn/no-null": "off",
    "unicorn/prefer-node-protocol": "error",
  },
  overrides: [
    {
      files: ["**/*.{config,conf}.{js,cjs,mjs,ts,mts,cts}", "**/scripts/**", "**/test/**"],
      rules: { "no-console": "off" },
    },
    {
      files: ["**/*.{test,spec}.{js,jsx,ts,tsx}", "**/__tests__/**"],
      env: { jest: true },
      rules: { "typescript/no-explicit-any": "off" },
    },
    {
      files: ["**/*.d.ts"],
      rules: {
        "no-var": "off",
        "typescript/no-explicit-any": "off",
        "typescript/no-unused-vars": "off",
      },
    },
  ],
});

export default config;
