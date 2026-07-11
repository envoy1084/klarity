import { defineConfig } from "oxfmt";

import base from "./base.ts";

const config = defineConfig({ ...base, printWidth: 80 });

export default config;
