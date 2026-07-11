import react from "./react.js";

/** @satisfies {import('oxlint').OxlintConfig} */
const config = {
  extends: [react],
  plugins: ["nextjs"],
  rules: {
    "nextjs/google-font-display": "warn",
    "nextjs/google-font-preconnect": "warn",
    "nextjs/no-async-client-component": "error",
    "nextjs/no-document-import-in-page": "error",
    "nextjs/no-head-element": "error",
    "nextjs/no-html-link-for-pages": "error",
    "nextjs/no-img-element": "warn",
  },
};

export default config;
