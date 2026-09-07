# Desktop and future Steam release

The same TypeScript simulation and React interface power both the browser game and a standalone Electron desktop application. No game-engine rewrite or hosted server is needed to run the desktop build. Windows is the first packaging target; other platforms require their own builds and testing.

## Local commands

Use Node 22 (the web build has a known native shutdown problem on Node 24/Windows).

- `npm run desktop:build` builds the web game and stages the offline desktop runtime.
- `npm run desktop:play` starts the staged desktop game.
- `npm run desktop:smoke` starts a hidden test window with a separate test profile, verifies the bundled interface can persist a valid game through the preload bridge, then exits.
- `npm run desktop:package` builds and packages for the current operating system and architecture. On Windows x64, output is `release/Civ Idle-win32-x64/Civ Idle.exe`. Distribute the entire directory, not the executable alone.
- `npm test` checks the simulation, browser save compatibility, and desktop save persistence.

Electron binaries download on first use. The packaged game does not require Node, npm, an internet connection, or the local development server. This is a development package, not a signed installer or a Steam release.

## Boundaries to preserve

- `lib/game.ts`: pure data and game rules. No DOM, React, Electron, Steam, filesystem, or network imports. New concepts and resource chains belong here.
- `components/concept-map.tsx` and `app/page.tsx`: presentation and game actions.
- `lib/save-store.mjs`: storage adapter chosen at runtime. Keep platform-specific APIs behind this boundary.
- `desktop/preload.cjs`: two narrow IPC methods for loading and saving. Do not expose filesystem paths, arbitrary IPC, shell commands, or Node APIs to the renderer.
- `desktop/main.mjs`: local asset loading, desktop lifecycle, and trusted file saving. Renderer uses context isolation and sandboxing; remote network requests, popups, and external navigation are blocked.
- `desktop/save-store.mjs`: serialized atomic replacement of one fixed save file. Pending writes drain on normal exit. Invalid payloads do not replace an existing save.

## Saves and future updates

Browser saves retain the existing `civ-idle-v1` key and JSON format. Desktop saves use `saves/settlement.json` beneath Electron's user-data directory (normally `%APPDATA%/civ-idle` on Windows). This is outside the install directory, so reinstalling game files need not erase progress. Browser and desktop currently have separate saves; import/export is future work.

The save's `version` is currently 1. Before changing the schema, implement and test explicit migrations. Do not change stable job/resource IDs casually: saves refer to them. Unsupported or corrupt saves are preserved and autosaving is blocked until the problem is resolved. Steam Cloud conflict resolution, backup recovery, and multiple save slots are not implemented yet.

## Steam release work later

1. Set up the Steamworks application and obtain the real App ID and depot IDs. No account setup, fee, or upload is performed by these scripts.
2. Package and test the complete Windows directory on a clean machine. Configure `Civ Idle.exe` as the Steam launch executable and upload the directory using SteamPipe.
3. Add achievements, overlay support, and other Steamworks features behind a desktop-only integration boundary when needed. Keep the browser and offline build functional when Steam is absent.
4. Configure Steam Auto-Cloud for the save path or implement Steam Remote Storage; test conflicts and offline reconnection. Never assume writing a file enables Steam Cloud automatically.
5. Before release: review dependency licenses, replace development branding/icons, test save upgrades, performance, accessibility, controller/Steam Deck support if targeted, and complete Steam store/build review. Signing and platform-specific installers remain separate release tasks.

Official references:
- https://partner.steamgames.com/doc/sdk/uploading
- https://partner.steamgames.com/doc/features/cloud
- https://www.electronjs.org/docs/latest/tutorial/context-isolation
- https://www.electronjs.org/docs/latest/tutorial/security

Continue local development by default. Do not push, publish, or upload builds unless requested.
