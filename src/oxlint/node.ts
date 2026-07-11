import { defineConfig } from "oxlint";

import base from "./base.ts";

const config = defineConfig({
  extends: [base],
  env: { builtin: true, es2024: true, node: true },
});

export default config;
