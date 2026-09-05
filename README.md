# Civ Idle

A browser idle game focused entirely on the dawn of civilization.

Start with five people. Assign hunters, gatherers, woodcutters, stone collectors, tool makers and thinkers. Discover controlled fire, early farming, pottery, hide working and village traditions. Build homes and storage; redistribute workers freely.

- Nine connected resources and eleven jobs.
- Tools and clothing improve production; pottery expands storage.
- Everyone consumes food. Shortages slow non-food work without killing settlers.
- Device-local autosave and up to eight hours of offline progress.

## Development

Use Node.js 22 (22.17.0 tested). Node 24 on Windows currently encounters a native shutdown error in the build tool after prerendering.

```sh
npm ci
npm run dev
npm run build
node --experimental-strip-types --test tests/game.test.mjs
npx tsc --noEmit
```

`lib/game.ts` holds the data-driven economy and deterministic simulation. `app/page.tsx` holds the interface. Build output is `dist/client`.

## Hosting

The GitHub Pages workflow builds the same game under `/Civ-Idle/`. Set repository Settings → Pages → Source to **GitHub Actions**. Sites deployment uses the root path.

Saves are separate for each site/browser. Clearing browser data removes the save. Balancing is prototype-level; the entire chapter is playable.
