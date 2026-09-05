export type Game = {
  version: number;
  stock: Record<string, number>;
  workers: Record<string, number>;
  population: number;
  tech: string[];
  buildings: { home: number; warehouse: number };
  time: number;
  savedAt: number;
  paused: boolean;
};
export const eras = ['Dawn of civilization'];
export const resources: Record<
  string,
  { name: string; symbol: string; color: string; era: number }
> = {
  food: { name: 'Food', symbol: '◒', color: '#b4cd80', era: 0 },
  wood: { name: 'Wood', symbol: '≋', color: '#c19b70', era: 0 },
  stone: { name: 'Stone', symbol: '◆', color: '#a7b7c8', era: 0 },
  tools: { name: 'Tools', symbol: '⚒', color: '#e4bd70', era: 0 },
  knowledge: { name: 'Knowledge', symbol: '✧', color: '#b4a4df', era: 0 },
  hides: { name: 'Hides', symbol: '◇', color: '#d0ac8a', era: 0 },
  clay: { name: 'Clay', symbol: '◓', color: '#d6a18b', era: 0 },
  pottery: { name: 'Pottery', symbol: '◡', color: '#dbb587', era: 0 },
  clothing: { name: 'Clothing', symbol: '⋈', color: '#aebdd6', era: 0 },
};
type Job = {
  id: string;
  name: string;
  description: string;
  group: string;
  tech?: string;
  input: Record<string, number>;
  output: Record<string, number>;
};
export const jobs: Job[] = [
  {
    id: 'gatherer',
    name: 'Gatherer',
    description: 'Forage for berries, roots and a first foothold.',
    group: 'food',
    input: {},
    output: { food: 1 },
  },
  {
    id: 'hunter',
    name: 'Hunter',
    description: 'Track wild game beyond the camp.',
    group: 'food',
    input: {},
    output: { food: 1.2, hides: 0.2 },
  },
  {
    id: 'woodcutter',
    name: 'Woodcutter',
    description: 'Timber for homes, tools and the fires to come.',
    group: 'gather',
    input: {},
    output: { wood: 1 },
  },
  {
    id: 'knapper',
    name: 'Stone collector',
    description: 'Find the foundations of a lasting settlement.',
    group: 'gather',
    input: {},
    output: { stone: 0.8 },
  },
  {
    id: 'toolmaker',
    name: 'Tool maker',
    description: 'Better tools make every pair of hands more capable.',
    group: 'craft',
    input: { wood: 0.3, stone: 0.3 },
    output: { tools: 0.35 },
  },
  {
    id: 'thinker',
    name: 'Thinker',
    description: 'Observe the world. Imagine what comes next.',
    group: 'knowledge',
    input: {},
    output: { knowledge: 0.6 },
  },
  {
    id: 'farmer',
    name: 'Farmer',
    description: 'Reliable harvests support a growing population.',
    group: 'food',
    tech: 'agriculture',
    input: {},
    output: { food: 3 },
  },
  {
    id: 'claydigger',
    name: 'Clay digger',
    description: 'Gather river clay for vessels and a settled life.',
    group: 'gather',
    tech: 'pottery',
    input: {},
    output: { clay: 0.8 },
  },
  {
    id: 'potter',
    name: 'Potter',
    description: 'Fire clay with wood to make useful storage vessels.',
    group: 'craft',
    tech: 'pottery',
    input: { clay: 0.5, wood: 0.25 },
    output: { pottery: 0.35 },
  },
  {
    id: 'tanner',
    name: 'Clothes maker',
    description: 'Turn hunting hides into warm, durable clothing.',
    group: 'craft',
    tech: 'clothing',
    input: { hides: 0.3 },
    output: { clothing: 0.3 },
  },
  {
    id: 'elder',
    name: 'Village elder',
    description: 'Share stories and lessons around the hearth.',
    group: 'knowledge',
    tech: 'community',
    input: { food: 0.25 },
    output: { knowledge: 1.8 },
  },
];
type Tech = {
  id: string;
  name: string;
  era: number;
  requires: string[];
  cost: Record<string, number>;
  description: string;
};
export const technologies: Tech[] = [
  {
    id: 'fire',
    name: 'Controlled fire',
    era: 0,
    requires: [],
    cost: { knowledge: 20, wood: 25, stone: 10 },
    description: 'Gather around a reliable hearth. Food jobs produce 20% more.',
  },
  {
    id: 'agriculture',
    name: 'Early farming',
    era: 0,
    requires: ['fire'],
    cost: { knowledge: 55, wood: 40, tools: 15 },
    description: 'Plant your first fields. Unlock farmers producing 3 food/s.',
  },
  {
    id: 'pottery',
    name: 'Pottery',
    era: 0,
    requires: ['fire'],
    cost: { knowledge: 65, stone: 35, wood: 40 },
    description:
      'Unlock clay diggers and potters. Each vessel adds 2 storage capacity.',
  },
  {
    id: 'clothing',
    name: 'Hide working',
    era: 0,
    requires: ['fire'],
    cost: { knowledge: 70, hides: 30, tools: 20 },
    description:
      'Turn hides into clothing. Warm clothes improve all work by up to 25%.',
  },
  {
    id: 'community',
    name: 'Village traditions',
    era: 0,
    requires: ['agriculture', 'pottery', 'clothing'],
    cost: { knowledge: 180, food: 150, pottery: 35, clothing: 25 },
    description:
      'Become a lasting community. Unlock elders and add 5 population capacity.',
  },
];
export const initialState = (): Game => ({
  version: 1,
  stock: Object.fromEntries(
    Object.keys(resources).map((k) => [k, k === 'food' ? 25 : 0]),
  ),
  workers: { gatherer: 2 },
  population: 5,
  tech: [],
  buildings: { home: 0, warehouse: 0 },
  time: 0,
  savedAt: Date.now(),
  paused: false,
});
export function validSave(value: unknown): value is Game {
  if (!value || typeof value !== 'object') return false;
  const g = value as Game;
  const count = (n: unknown) =>
    typeof n === 'number' && Number.isFinite(n) && n >= 0;
  return (
    g.version === 1 &&
    count(g.population) &&
    Number.isInteger(g.population) &&
    g.population >= 5 &&
    g.population <= 10000 &&
    typeof g.paused === 'boolean' &&
    count(g.time) &&
    count(g.savedAt) &&
    !!g.stock &&
    Object.keys(resources).every((k) => count(g.stock[k])) &&
    !!g.buildings &&
    (['home', 'warehouse'] as const).every(
      (k) => count(g.buildings[k]) && Number.isInteger(g.buildings[k]),
    ) &&
    Array.isArray(g.tech) &&
    g.tech.every((t) => technologies.some((x) => x.id === t)) &&
    new Set(g.tech).size === g.tech.length &&
    !!g.workers &&
    Object.entries(g.workers).every(
      ([id, n]) =>
        count(n) &&
        Number.isInteger(n) &&
        jobs.some((j) => j.id === id && unlocked(g, j.tech)),
    ) &&
    Object.values(g.workers).reduce((a, b) => a + b, 0) <= g.population
  );
}
export const unlocked = (g: Game, t?: string) => !t || g.tech.includes(t);
export const housing = (g: Game) =>
  10 + g.buildings.home * 5 + (g.tech.includes('community') ? 5 : 0);
export const capacity = (g: Game, _k: string) =>
  500 + g.buildings.warehouse * 500 + Math.floor(g.stock.pottery || 0) * 2;
export const workerCost = (g: Game) =>
  Math.ceil(20 * Math.pow(1.12, g.population - 5));
export const buildingCost = (
  g: Game,
  k: 'home' | 'warehouse',
): Record<string, number> =>
  k === 'home'
    ? {
        wood: Math.ceil(35 * Math.pow(1.28, g.buildings.home)),
        stone: Math.ceil(15 * Math.pow(1.28, g.buildings.home)),
      }
    : {
        wood: Math.ceil(70 * Math.pow(1.3, g.buildings.warehouse)),
        stone: Math.ceil(40 * Math.pow(1.3, g.buildings.warehouse)),
      };
const pay = (g: Game, c: Record<string, number>) => {
  if (!Object.entries(c).every(([k, v]) => (g.stock[k] || 0) >= v))
    return false;
  for (const [k, v] of Object.entries(c)) g.stock[k] -= v;
  return true;
};
export function assign(g: Game, id: string, delta: number) {
  if (
    !Number.isInteger(delta) ||
    !jobs.some((j) => j.id === id && unlocked(g, j.tech))
  )
    return g;
  const n = g.workers[id] || 0;
  const free =
    g.population - Object.values(g.workers).reduce((a, b) => a + b, 0);
  if (n + delta < 0 || delta > free) return g;
  return { ...g, workers: { ...g.workers, [id]: n + delta } };
}
export function recruit(g: Game) {
  const n = structuredClone(g);
  if (n.population >= housing(n) || !pay(n, { food: workerCost(n) })) return g;
  n.population++;
  return n;
}
export function research(g: Game, id: string) {
  const t = technologies.find((t) => t.id === id);
  if (!t || g.tech.includes(id) || !t.requires.every((x) => g.tech.includes(x)))
    return g;
  const n = structuredClone(g);
  if (!pay(n, t.cost)) return g;
  n.tech.push(id);
  return n;
}
export function build(g: Game, k: 'home' | 'warehouse') {
  const n = structuredClone(g);
  if (!pay(n, buildingCost(n, k))) return g;
  n.buildings[k]++;
  return n;
}
function step(g: Game, dt: number, blocked?: string[]) {
  const bonus =
    1 +
    Math.min(1, g.stock.tools / 200) +
    Math.min(0.25, g.stock.clothing / 200);
  const hungry = g.stock.food < g.population * 0.15 * dt;
  for (const j of jobs) {
    const workers = g.workers[j.id] || 0;
    if (!workers || !unlocked(g, j.tech)) continue;
    let amount =
      workers *
      dt *
      bonus *
      (j.group === 'food' && g.tech.includes('fire') ? 1.2 : 1) *
      (hungry && j.group !== 'food' ? 0.25 : 1);
    let fraction = 1;
    for (const [k, v] of Object.entries(j.input))
      fraction = Math.min(fraction, (g.stock[k] || 0) / (v * amount));
    if (fraction < 0.999) blocked?.push(j.id);
    amount *= Math.max(0, fraction);
    for (const [k, v] of Object.entries(j.input))
      g.stock[k] = Math.max(0, g.stock[k] - v * amount);
    for (const [k, v] of Object.entries(j.output))
      g.stock[k] = Math.min(capacity(g, k), (g.stock[k] || 0) + v * amount);
  }
  g.stock.food = Math.max(0, g.stock.food - g.population * 0.15 * dt);
  g.time += dt;
}
export function advance(g: Game, seconds: number) {
  if (g.paused || !Number.isFinite(seconds) || seconds <= 0) return g;
  const n = structuredClone(g);
  let remaining = Math.min(seconds, 28800);
  while (remaining > 0) {
    const dt = Math.min(1, remaining);
    step(n, dt);
    remaining -= dt;
  }
  return n;
}
export function ratePreview(g: Game) {
  const n = structuredClone(g),
    blocked: string[] = [];
  if (!g.paused) step(n, 1, blocked);
  return {
    rates: Object.fromEntries(
      Object.keys(resources).map((k) => [k, n.stock[k] - g.stock[k]]),
    ),
    blocked,
  };
}
