import { packager } from '@electron/packager';
import fs from 'node:fs/promises';
const electron = JSON.parse(
  await fs.readFile('node_modules/electron/package.json', 'utf8'),
);
const output = await packager({
  dir: 'work/desktop-app',
  out: 'release',
  name: 'Civ Idle',
  platform: process.platform,
  arch: process.arch,
  electronVersion: electron.version,
  overwrite: true,
  asar: true,
  prune: false,
  ignore: /smoke-profile/,
});
console.log(output.join('\n'));

