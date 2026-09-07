import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
const target = path.resolve('work/desktop-app');
await fs.access('dist/client/index.html');
await fs.mkdir(path.join(target, 'desktop'), { recursive: true });
await fs.cp('dist/client', path.join(target, 'web'), { recursive: true });
for (const file of ['main.mjs', 'preload.cjs', 'save-store.mjs'])
  await fs.copyFile(
    path.join('desktop', file),
    path.join(target, 'desktop', file),
  );
const game = await fs.readFile('lib/game.ts', 'utf8');
await fs.writeFile(
  path.join(target, 'desktop/game.mjs'),
  ts.transpileModule(game, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
    },
  }).outputText,
);
const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'));
await fs.writeFile(
  path.join(target, 'package.json'),
  JSON.stringify(
    {
      name: 'civ-idle',
      productName: 'Civ Idle',
      version: pkg.version,
      type: 'module',
      main: 'desktop/main.mjs',
    },
    null,
    2,
  ),
);
console.log('Desktop runtime staged in ' + target);
