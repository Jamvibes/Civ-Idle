# Civ Idle

A browser idle game focused on the dawn of civilization.

Assign a small population to gather food, hunt, collect wood and stone, make tools, and discover early farming, pottery, hide working, and village traditions.

## Play

The online testing link will be added after deployment.

## Development

Requires Node.js 22.13+.

```sh
npm ci
npm run dev
npm run build
node --experimental-strip-types --test tests/game.test.mjs
```

Saves are device-local. Offline progress is capped at eight hours. Game definitions and simulation live in `lib/game.ts`.
