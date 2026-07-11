/** @satisfies {import('oxfmt').OxfmtConfig} */
const config = {
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
  singleQuote: true,
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
    groups: [
      ["builtin", "external"],
      "internal",
      ["parent", "sibling", "index"],
      "type",
      "unknown",
    ],
    newlinesBetween: true,
  },
  sortPackageJson: true,
};

export default config;
