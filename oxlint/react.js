import base from "./base.js";

/** @satisfies {import('oxlint').OxlintConfig} */
const config = {
  extends: [base],
  plugins: ["react", "react-perf", "jsx-a11y"],
  env: { browser: true, builtin: true, es2024: true },
  settings: { react: { version: "detect" } },
  rules: {
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-has-content": "error",
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/no-static-element-interactions": "warn",
    "react/jsx-key": "error",
    "react/no-array-index-key": "warn",
    "react/no-danger": "warn",
    "react/no-direct-mutation-state": "error",
    "react/no-unknown-property": "error",
    "react/rules-of-hooks": "error",
    "react-perf/jsx-no-new-array-as-prop": "warn",
    "react-perf/jsx-no-new-function-as-prop": "warn",
    "react-perf/jsx-no-new-object-as-prop": "warn",
  },
};

export default config;
