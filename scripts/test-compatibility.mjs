// oxlint-disable no-await-in-loop -- Each consumer owns one compiler and runner version.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const directory = await mkdtemp(join(tmpdir(), "klarity-compatibility-"));

function run(command, args, cwd, expectedStatus = 0) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    timeout: 180_000,
    env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" },
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  assert.ifError(result.error);
  assert.equal(result.status, expectedStatus, `${command} ${args.join(" ")}\n${output}`);
  return output;
}

async function json(path, value) {
  await writeFile(path, JSON.stringify(value, null, 2));
}

try {
  run("pnpm", ["pack", "--pack-destination", directory], root);
  const tarball = (await readdir(directory)).find((file) => file.endsWith(".tgz"));
  assert.ok(tarball, "Expected a packed Klarity release");

  for (const [typescript, vitest] of [
    ["6.0.3", "4.1.10"],
    ["7.0.2", "5.0.3"],
  ]) {
    const consumer = join(directory, `typescript-${typescript}`);
    await mkdir(consumer);
    await json(join(consumer, "package.json"), {
      name: "klarity-compatibility-consumer",
      private: true,
      type: "module",
      devDependencies: {
        klarity: `file:${join(directory, tarball)}`,
        typescript,
        tsdown: "0.23.0",
        publint: "0.3.25",
        vitest,
        "@vitest/coverage-v8": vitest,
        react: "19.3.0",
        "@types/react": "19.3.0",
        "@types/node": "24.13.3",
      },
    });
    run("pnpm", ["install", "--ignore-workspace", "--ignore-scripts"], consumer);

    for (const preset of ["library", "node", "browser", "react"]) {
      const fixture = join(consumer, preset);
      await mkdir(join(fixture, "src"), { recursive: true });
      await json(join(fixture, "package.json"), {
        name: `test-${preset}`,
        version: "1.0.0",
        type: "module",
        license: "MIT",
        files: ["dist"],
        ...(preset === "react" ? { peerDependencies: { react: "^19.0.0" } } : {}),
      });
      await json(join(fixture, "tsconfig.json"), {
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "Bundler",
          strict: true,
          skipLibCheck: true,
          declaration: true,
          declarationMap: true,
          jsx: "react-jsx",
          types: [],
        },
        include: ["src"],
      });
      const entry = preset === "react" ? "src/index.tsx" : "src/index.ts";
      await writeFile(join(fixture, "src/value.ts"), "export const answer = 42;\n");
      await writeFile(
        join(fixture, entry),
        `export { answer } from "./value.js";\n${
          preset === "react"
            ? "export const Greeting = ({ name }: { name: string }) => <span>{name}</span>;\n"
            : "export const identity = <T>(value: T) => ({ value });\n"
        }`,
      );
      for (const unbundle of [false, true]) {
        await writeFile(
          join(fixture, "tsdown.config.ts"),
          `import defineConfig from "klarity/tsdown/${preset}";\n` +
            `export default defineConfig({ unbundle: ${unbundle}, tsconfig: "tsconfig.json" });\n`,
        );
        run("pnpm", ["exec", "tsdown"], fixture);
        const declaration = await readFile(join(fixture, "dist/index.d.ts"), "utf8");
        assert.match(declaration, /answer/);
        assert.match(declaration, preset === "react" ? /Greeting/ : /identity/);
        const map = JSON.parse(await readFile(join(fixture, "dist/index.d.ts.map"), "utf8"));
        assert.equal(map.version, 3);
        assert.ok(
          map.sources.some((source) =>
            source.endsWith(preset === "react" ? "index.tsx" : "index.ts"),
          ),
        );
        run(
          "pnpm",
          [
            "exec",
            "tsc",
            "--ignoreConfig",
            "--noEmit",
            "--skipLibCheck",
            "false",
            "--types",
            "node",
            "--module",
            "NodeNext",
            "--moduleResolution",
            "NodeNext",
            "dist/index.d.ts",
          ],
          fixture,
        );
      }
    }

    const warningFixture = join(consumer, "library");
    await writeFile(
      join(warningFixture, "tsdown.config.ts"),
      'import defineConfig from "klarity/tsdown/library";\n' +
        'export default defineConfig({ plugins: [{ name: "warning-regression", buildStart() { this.warn("klarity-unrelated-warning"); } }] });\n',
    );
    const output = run("pnpm", ["exec", "tsdown"], warningFixture, 1);
    assert.match(output, /klarity-unrelated-warning/);

    if (typescript.startsWith("7.")) {
      await writeFile(
        join(warningFixture, "tsdown.config.ts"),
        'import defineConfig from "klarity/tsdown/library";\n' +
          "export default defineConfig({ suppressWarnings: [] });\n",
      );
      const unsuppressed = run("pnpm", ["exec", "tsdown"], warningFixture, 1);
      assert.match(unsuppressed, /TypeScript 7\.0 does not yet have a stable API/);
    }

    await mkdir(join(consumer, "src"));
    await writeFile(
      join(consumer, "src/sum.ts"),
      "export const sum = (a: number, b: number) => a + b;\n",
    );
    await writeFile(
      join(consumer, "sum.test.ts"),
      'import { expect, it } from "vitest";\n' +
        'import { sum } from "./src/sum.js";\n' +
        'it("adds numbers", () => expect(sum(2, 3)).toBe(5));\n',
    );
    await writeFile(
      join(consumer, "vitest.config.ts"),
      'import defineConfig from "klarity/vitest/node";\n' +
        'export default defineConfig({ test: { include: ["sum.test.ts"], coverage: { enabled: true } } });\n',
    );
    run("pnpm", ["exec", "vitest", "run"], consumer);
    assert.ok((await readFile(join(consumer, "coverage/lcov.info"), "utf8")).includes("sum.ts"));
    process.stdout.write(
      `Passed TypeScript ${typescript}, Vitest ${vitest}: presets, declarations, maps, warnings, coverage\n`,
    );
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}
