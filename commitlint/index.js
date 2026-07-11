import conventional from "@commitlint/config-conventional";

/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "body-leading-blank": [2, "always"],
    "body-max-line-length": [2, "always", 100],
    "footer-leading-blank": [2, "always"],
    "footer-max-line-length": [2, "always", 100],
    "header-max-length": [2, "always", 100],
    "scope-case": [2, "always", "kebab-case"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "type-enum": conventional.rules["type-enum"],
  },
  prompt: {
    messages: { skip: "(press enter to skip)" },
  },
};

export default config;
