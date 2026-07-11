import base from "./base.js";

/** @satisfies {import('oxlint').OxlintConfig} */
const config = {
  extends: [base],
  env: { builtin: true, es2024: true, node: true },
};

export default config;
