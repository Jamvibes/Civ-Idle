import { spawnSync } from 'node:child_process';
const env = { ...process.env };
delete env.GITHUB_PAGES;
const result = spawnSync(
  process.execPath,
  ['node_modules/vinext/dist/cli.js', 'build'],
  { stdio: 'inherit', env },
);
if (result.status !== 0) process.exit(result.status || 1);
await import('./desktop-stage.mjs');
