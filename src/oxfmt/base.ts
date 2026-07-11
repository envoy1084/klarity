import { defineConfig } from "oxfmt";

const config = defineConfig({
  arrowParens: "always",
  bracketSameLine: false,
  bracketSpacing: true,
  endOfLine: "lf",
  insertFinalNewline: true,
  jsxSingleQuote: false,
  printWidth: 100,
  proseWrap: "preserve",
  quoteProps: "as-needed",
  semi: true,
  singleAttributePerLine: false,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  useTabs: false,
  ignorePatterns: [
    "**/.next/**",
    "**/.output/**",
    "**/.turbo/**",
    "**/build/**",
    "**/coverage/**",
    "**/dist/**",
    "**/node_modules/**",
    "**/pnpm-lock.yaml",
  ],
  sortImports: {
    customGroups: [
      {
        groupName: "react",
        elementNamePattern: ["react", "react/**", "react-dom", "react-dom/**"],
      },
      { groupName: "next", elementNamePattern: ["next", "next/**"] },
      { groupName: "tanstack", elementNamePattern: ["@tanstack/**"] },
      { groupName: "effect", elementNamePattern: ["effect", "effect/**"] },
      { groupName: "effect-scoped", elementNamePattern: ["@effect/**"] },
    ],
    groups: [
      "builtin",
      "react",
      "next",
      "tanstack",
      ["effect", "effect-scoped"],
      "external",
      ["internal", "subpath"],
      ["parent", "sibling", "index"],
      "style",
      "type-import",
      "unknown",
    ],
    newlinesBetween: true,
  },
  sortPackageJson: true,
});

export default config;
