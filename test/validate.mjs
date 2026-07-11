import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const temporary = mkdtempSync(join(tmpdir(), 'envoy-config-'));
/**
 * @param {string} command
 * @param {string[]} args
 * @param {string} [cwd]
 * @param {string} [input]
 */
const run = (command, args, cwd = temporary, input) =>
  execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    input,
    stdio: input ? ['pipe', 'pipe', 'pipe'] : 'pipe',
  });

try {
  run('pnpm', ['pack', '--pack-destination', temporary], root);
  const archive = join(temporary, run('sh', ['-c', 'ls envoy1084-config-*.tgz']).trim());
  writeFileSync(
    join(temporary, 'package.json'),
    JSON.stringify({
      name: 'config-consumer',
      private: true,
      type: 'module',
      dependencies: {
        '@commitlint/cli': '^21.2.1',
        '@commitlint/config-conventional': '^21.2.0',
        '@envoy1084/config': `file:${archive}`,
        '@types/node': '^24.0.0',
        oxfmt: '^0.58.0',
        oxlint: '^1.73.0',
        react: '^19.0.0',
        '@types/react': '^19.0.0',
        tsdown: '^0.22.4',
        typescript: '^7.0.2',
      },
    }),
  );
  run('pnpm', ['install', '--ignore-scripts']);

  const tsconfigs = [
    'app',
    'base',
    'library',
    'library-browser',
    'library-node',
    'library-react',
    'node',
    'react-native',
    'test',
  ];
  for (const preset of tsconfigs) {
    writeFileSync(
      join(temporary, 'tsconfig.json'),
      JSON.stringify({
        extends: `@envoy1084/config/tsconfig/${preset}`,
        compilerOptions: { types: [] },
        files: ['index.ts'],
      }),
    );
    writeFileSync(join(temporary, 'index.ts'), 'export const answer: number = 42;\n');
    run('pnpm', ['exec', 'tsc', '--noEmit']);
  }

  writeFileSync(
    join(temporary, 'oxlint.config.ts'),
    "import config from '@envoy1084/config/oxlint/node';\nexport default config;\n",
  );
  writeFileSync(
    join(temporary, 'index.ts'),
    "import { readFile } from 'node:fs/promises';\nexport { readFile };\n",
  );
  run('pnpm', ['exec', 'oxlint', '--deny-warnings', 'index.ts']);

  writeFileSync(
    join(temporary, 'oxfmt.config.ts'),
    "export { default } from '@envoy1084/config/oxfmt';\n",
  );
  writeFileSync(join(temporary, 'format.ts'), "export const value={nested:'ok'}\n");
  run('pnpm', ['exec', 'oxfmt', '--write', 'format.ts']);
  assert.match(readFileSync(join(temporary, 'format.ts'), 'utf8'), /value = \{ nested: 'ok' \};/);

  writeFileSync(
    join(temporary, 'commitlint.config.js'),
    "export { default } from '@envoy1084/config/commitlint';\n",
  );
  run(
    'pnpm',
    ['exec', 'commitlint', '--config', 'commitlint.config.js'],
    temporary,
    'feat(config): validate preset\n',
  );
  assert.throws(() =>
    run(
      'pnpm',
      ['exec', 'commitlint', '--config', 'commitlint.config.js'],
      temporary,
      'bad message\n',
    ),
  );

  for (const preset of ['library', 'node', 'browser', 'react']) {
    writeFileSync(
      join(temporary, 'package.json'),
      JSON.stringify({
        name: `fixture-${preset}`,
        version: '1.0.0',
        private: true,
        type: 'module',
        dependencies: {
          '@envoy1084/config': `file:${archive}`,
          tsdown: '^0.22.4',
          typescript: '^7.0.2',
        },
        peerDependencies: preset === 'react' ? { react: '^19.0.0' } : undefined,
      }),
    );
    writeFileSync(
      join(temporary, 'tsdown.config.ts'),
      `import defineConfig from '@envoy1084/config/tsdown/${preset}';\nexport default defineConfig({ entry: ['index.ts'], publint: false, dts: false });\n`,
    );
    writeFileSync(join(temporary, 'index.ts'), 'export const answer = 42;\n');
    run('pnpm', ['exec', 'tsdown']);
    assert.match(readFileSync(join(temporary, 'dist/index.js'), 'utf8'), /answer/);
  }

  console.log(`Validated packed package in ${temporary}`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
