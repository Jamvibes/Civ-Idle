import type { NextConfig } from 'next';
const config: NextConfig = {
  output: 'export',
  ...(process.env.GITHUB_PAGES === 'true' ? { basePath: '/Civ-Idle' } : {}),
};
export default config;
