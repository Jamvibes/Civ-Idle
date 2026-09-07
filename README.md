# Civ Idle

A browser idle game focused entirely on the dawn of civilization.

Start paused with five people and no food. Assign hunters and gatherers, then unpause to discover resources, professions and early technologies through normal gameplay. Organise a draggable network of connected concepts as your settlement grows.

- Gathering, hunting, fishing, farming, crafts, shelters and animal keeping.
- Tools and clothing improve production; pottery expands storage.
- Automatic population growth; non-food workers need positive food production.
- Device-local autosave and up to eight hours of offline progress.

## Development

Use Node.js 22 (22.17.0 tested). Node 24 on Windows currently encounters a native shutdown error in the build tool after prerendering.

```sh
npm ci
npm run dev
npm run build
npm test
npx tsc --noEmit
```

`lib/game.ts` holds the data-driven economy and deterministic simulation. `app/page.tsx` holds the interface. Build output is `dist/client`.

## Hosting

The GitHub Pages workflow builds the same game under `/Civ-Idle/`. Set repository Settings → Pages → Source to **GitHub Actions**. Sites deployment uses the root path.

Saves are separate for each site/browser. Clearing browser data removes the save. Balancing is prototype-level; the entire chapter is playable.

## Desktop / future Steam release

The browser game now also has a standalone desktop packaging path. Run `npm run desktop:build`, then `npm run desktop:play` with Node 22. `npm run desktop:package` creates a local distributable folder. See [desktop/README.md](desktop/README.md) for architecture, saves, packaging, and the remaining Steam release work. This does not publish anything.

Discoveries emerge from exploration, production and activity milestones, including offline work. Undiscovered concepts remain hidden. Tools gradually wear out, while craftspeople maintain modest reserves. Existing saves preserve unlocked discoveries.
