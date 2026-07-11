import type { UserConfig } from "@commitlint/types";

import { conventionalTypes } from "./types.ts";

export interface CommitlintOptions {
  /** Additional Conventional Commit types appended to the standard set. */
  types?: readonly string[];
  /** Optional allowlist for the `(scope)` segment. Omit to allow any kebab-case scope. */
  scopes?: readonly string[];
  /** Rules merged last, for project-specific policy. */
  rules?: UserConfig["rules"];
}

export function defineCommitlintConfig(options: CommitlintOptions = {}): UserConfig {
  const types = [...new Set([...conventionalTypes, ...(options.types ?? [])])];

  return {
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
      "type-enum": [2, "always", types],
      ...(options.scopes ? { "scope-enum": [2, "always", [...options.scopes]] } : {}),
      ...options.rules,
    },
    prompt: {
      messages: { skip: "(press enter to skip)" },
    },
  };
}

export { conventionalTypes } from "./types.ts";
export type { ConventionalType } from "./types.ts";

export default defineCommitlintConfig();
