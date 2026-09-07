export type Game = {
  upgradedShelters?: number;
  dwellingProgress?: number;
  activity?: Record<string, number>;
  herd?: {
    goats: number;
    establishment: number;
    enclosures: number;
    enclosureProgress: number;
  };
  shelters?: number;
  shelterProgress?: number;
  nodePositions?: Record<string, { x: number; y: number }>;
  version: number;
  discoveries?: string[];
  randomSeed?: number;
  exploration?: { gatherer: number; hunter: number };
  settings?: {
    showHuntingGuide: boolean;
    autoGrowth?: boolean;
    showSettlementNeeds?: boolean;
  };
  produced?: Record<string, number>;
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
  fibres: { name: 'Plant fibres', symbol: '≀', color: '#a8bd83', era: 0 },
  cord: { name: 'Cordage', symbol: '∞', color: '#c7b388', era: 0 },
  points: { name: 'Stone points', symbol: '▴', color: '#a7b7c8', era: 0 },
  spears: {
    name: 'Stone-tipped spears',
    symbol: '↑',
    color: '#c7b388',
    era: 0,
  },
  baskets: { name: 'Baskets', symbol: '▥', color: '#c7b388', era: 0 },
  nets: { name: 'Fishing nets', symbol: '▦', color: '#91bbb7', era: 0 },
  sticks: { name: 'Wooden tools', symbol: '↟', color: '#d5b181', era: 0 },
  food: { name: 'Food', symbol: '◒', color: '#b4cd80', era: 0 },
  wood: { name: 'Wood', symbol: '≋', color: '#c19b70', era: 0 },
  stone: { name: 'Stone', symbol: '◆', color: '#a7b7c8', era: 0 },
  tools: { name: 'Stone tools', symbol: '⚒', color: '#e4bd70', era: 0 },
  knowledge: { name: 'Knowledge', symbol: '✧', color: '#b4a4df', era: 0 },
  hides: { name: 'Raw hides', symbol: '◇', color: '#d0ac8a', era: 0 },
  preparedhides: {
    name: 'Prepared hides',
    symbol: '▱',
    color: '#d9be93',
    era: 0,
  },
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
    id: 'hideworker',
    name: 'Hide worker',
    description:
      'Scrape, clean and work raw hides into useful coverings. Process 0.4 raw hides into 0.4 prepared hides per second before bonuses. Prepared hides supply shelters and clothing.',
    group: 'craft',
    tech: 'hidepreparation',
    input: { hides: 0.4 },
    output: { preparedhides: 0.4 },
  },
  {
    id: 'enclosurebuilder',
    name: 'Enclosure builder',
    description:
      'Build enclosures automatically from 20 wood and 10 cord over 100 worker-seconds. Each enclosure holds 8 goats.',
    group: 'craft',
    tech: 'animalkeeping',
    input: { wood: 0.2, cord: 0.1 },
    output: { enclosures: 0.01 },
  },
  {
    id: 'animalkeeper',
    name: 'Animal keeper',
    description:
      'Establish a goat herd over 100 worker-seconds, using 0.2 food/s per keeper. Each keeper then tends up to 4 goats. Tended goats browse locally and produce more food than their supplemental feeding costs. Shortages pause growth and production without killing animals.',
    group: 'craft',
    tech: 'animalkeeping',
    input: {},
    output: {},
  },
  {
    id: 'fibrecollector',
    name: 'Fibre collector',
    description: 'Collect useful plant fibres continuously.',
    group: 'gather',
    tech: 'fibres',
    input: {},
    output: { fibres: 0.8 },
  },
  {
    id: 'cordmaker',
    name: 'Cord maker',
    description: 'Twist fibres into cord for bindings, baskets and nets.',
    group: 'craft',
    tech: 'cordage',
    input: { fibres: 0.6 },
    output: { cord: 0.3 },
  },
  {
    id: 'pointmaker',
    name: 'Flint knapper',
    description: 'Shape collected stone into points for improved equipment.',
    group: 'craft',
    tech: 'stonepoints',
    input: { stone: 0.3 },
    output: { points: 0.15 },
  },
  {
    id: 'gearmaker',
    name: 'Equipment maker',
    description:
      'Combine wood, stone points and cord into spears. Hunters and fishers automatically use their best available gear. Gear wears out only through use.',
    group: 'craft',
    tech: 'spearmaking',
    input: { wood: 0.2, points: 0.1, cord: 0.1 },
    output: { spears: 0.05 },
  },
  {
    id: 'basketmaker',
    name: 'Basket maker',
    description:
      'Weave baskets to improve gathering by up to 20%. Each basket also adds 5 storage capacity.',
    group: 'craft',
    tech: 'basketry',
    input: { fibres: 0.3, cord: 0.1 },
    output: { baskets: 0.05 },
  },
  {
    id: 'netmaker',
    name: 'Net maker',
    description:
      'Weave cord into fishing nets. Fishers prefer nets to wooden tools; nets wear out through use.',
    group: 'craft',
    tech: 'netting',
    input: { cord: 0.3 },
    output: { nets: 0.05 },
  },
  {
    id: 'shelterbuilder',
    name: 'Shelter builder',
    description:
      'Automatically build wood-and-hide shelters. Each shelter takes 100 worker-seconds, 20 wood and 10 prepared hides, and adds room for 2 people. Construction pauses without materials or a positive food supply.',
    group: 'craft',
    tech: 'sheltermaking',
    input: { wood: 0.2, preparedhides: 0.1 },
    output: { shelters: 0.01 },
  },
  {
    id: 'woodworker',
    name: 'Woodworker',
    description:
      'Shape 0.4 wood/s into 0.4 wooden tools/s. Equipped hunters and fishers gain 25% food yield, rising to 50% with spear-making. Tools wear through use and are replaced automatically.',
    group: 'craft',
    tech: 'woodworking',
    input: { wood: 0.4 },
    output: { sticks: 0.4 },
  },
  {
    id: 'fisher',
    name: 'Fisher',
    description:
      'Catch fish automatically for 1.5 food/s. Wooden tools improve catches, but fishing continues without them.',
    group: 'food',
    tech: 'fishing',
    input: {},
    output: { food: 1.5 },
  },
  {
    id: 'hearthkeeper',
    name: 'Hearth keeper',
    description:
      'Burn 0.5 wood/s to supply 4 heat/s for automatic cooking. Heat is used immediately, never stored.',
    group: 'craft',
    tech: 'fire',
    input: { wood: 0.5 },
    output: {},
  },
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
    name: 'Wood gathering',
    description:
      'Gather 0.5 wood/s per worker before bonuses. Stone axes improve equipped workers’ efficiency by 100%. Baskets improve wood gathering by up to 20%. Used stone tools wear out and are replaced automatically.',
    group: 'gather',
    input: {},
    output: { wood: 0.5 },
  },
  {
    id: 'knapper',
    name: 'Stone collector',
    description:
      'Gather loose stones from the ground, riverbanks and exposed outcrops. Each collector brings back 0.8 stone/s before bonuses, without mining or excavation.',
    group: 'gather',
    input: {},
    output: { stone: 0.8 },
  },
  {
    id: 'toolmaker',
    name: 'Stone toolmaker',
    description:
      'Shape stone and fit wooden handles to make stone tools. Discoveries such as stone points and axes expand their uses without separate crafting professions.',
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
    description:
      'Automatically cultivate and harvest food. Each farmer produces 3 food/s before bonuses, with no planting or crop selection needed. Discovered grain varieties remain in the compendium.',
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
    tech: 'clayworking',
    input: {},
    output: { clay: 0.8 },
  },
  {
    id: 'potter',
    name: 'Potter',
    description:
      'Shape and fire clay using shared hearth heat. Each potter needs 0.5 clay and 2 heat/s before bonuses; shortages slow production automatically.',
    group: 'craft',
    tech: 'pottery',
    input: { clay: 0.5 },
    output: { pottery: 0.35 },
  },
  {
    id: 'tanner',
    name: 'Leather worker',
    description: 'Turn prepared hides into warm, durable clothing.',
    group: 'craft',
    tech: 'clothing',
    input: { preparedhides: 0.3 },
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
// Legacy knowledge fields remain readable in old saves, but no longer drive play.
export const compendium = [
  {
    id: 'wildgoats',
    name: 'Wild goats',
    category: 'Animals',
    group: 'Wildlife',
    job: 'hunter',
    description:
      'Browsing animals encountered on hunting routes. A settled farming community may learn to keep a small herd.',
  },
  {
    id: 'wildboar',
    name: 'Wild boar',
    category: 'Animals',
    group: 'Wildlife',
    job: 'hunter',
    description:
      'Wild pigs encountered while hunting. Recorded as wildlife for now.',
  },
  {
    id: 'deer',
    name: 'Deer',
    category: 'Animals',
    group: 'Wildlife',
    job: 'hunter',
    description:
      'Grazing wildlife encountered by hunters. Remains a hunting discovery, rather than a domestication unlock.',
  },
  {
    id: 'claydeposit',
    name: 'Clay deposit',
    category: 'Materials',
    group: 'Earth',
    job: 'hunter',
    description:
      'Fine, mouldable sediment found along a discovered river. Clay deposits can supply vessels once people learn to fire them.',
  },
  {
    id: 'fibreplants',
    name: 'Fibrous plants',
    category: 'Plants',
    group: 'Useful fibres',
    job: 'gatherer',
    description:
      'Strong strands from stems and leaves can be collected and twisted into bindings.',
  },
  {
    id: 'fallen-branches',
    name: 'Fallen branches',
    category: 'Plants',
    group: 'Wood',
    job: 'gatherer',
    description:
      'Deadwood found while foraging. Repeated collection reveals a reliable supply of wood for tools and fuel.',
  },
  {
    id: 'rice',
    name: 'Wild rice',
    category: 'Plants',
    group: 'Wild grains',
    job: 'gatherer',
    description:
      'A wild grain found in wet habitats. Its discovery contributes to early farming.',
  },
  {
    id: 'wheat',
    name: 'Wild wheat',
    category: 'Plants',
    group: 'Wild grains',
    job: 'gatherer',
    description:
      'Seed-bearing wild grasses that can be gathered and cultivated.',
  },
  {
    id: 'barley',
    name: 'Wild barley',
    category: 'Plants',
    group: 'Wild grains',
    job: 'gatherer',
    description:
      'A wild cereal whose seeds suggest the possibility of cultivation.',
  },
  {
    id: 'berries',
    name: 'Berry bushes',
    category: 'Plants',
    group: 'Other plants',
    job: 'gatherer',
    description: 'Seasonal fruit encountered while foraging.',
  },
  {
    id: 'roots',
    name: 'Edible roots',
    category: 'Plants',
    group: 'Other plants',
    job: 'gatherer',
    description: 'Food-bearing roots found beneath the soil.',
  },
  {
    id: 'spring',
    name: 'Freshwater spring',
    category: 'Water sources',
    group: 'Fresh water',
    job: 'hunter',
    description:
      'Clean-flowing fresh water found along a hunting route. Provides access to water for early farming.',
  },
  {
    id: 'river',
    name: 'Freshwater river',
    category: 'Water sources',
    group: 'Fresh water',
    job: 'hunter',
    description:
      'A river discovered while tracking game. Provides access to water for early farming.',
  },
];
export function farmingReady(g: Game) {
  const found = new Set(g.discoveries || []);
  return (
    compendium.some((e) => e.group === 'Wild grains' && found.has(e.id)) &&
    compendium.some((e) => e.group === 'Fresh water' && found.has(e.id))
  );
}
function explore(g: Game, job: string, amount: number) {
  if (job !== 'gatherer' && job !== 'hunter') return;
  g.exploration ??= { gatherer: 0, hunter: 0 };
  g.discoveries ??= [];
  g.exploration[job] += amount;
  const random = () => {
    g.randomSeed = ((g.randomSeed ?? 123456789) * 1664525 + 1013904223) >>> 0;
    return g.randomSeed / 4294967296;
  };
  while (g.exploration[job] >= 1) {
    g.exploration[job] -= 1;
    if (job === 'gatherer' && random() < 0.06) {
      g.stock.wood = Math.min(capacity(g, 'wood'), g.stock.wood + 1);
      g.produced ??= { ...g.stock };
      g.produced.wood = (g.produced.wood || 0) + 1;
      if (!g.discoveries.includes('fallen-branches'))
        g.discoveries.push('fallen-branches');
    }
    if (random() < 0.0125) {
      const options = compendium.filter(
        (e) =>
          e.job === job &&
          e.id !== 'fallen-branches' &&
          (e.id !== 'claydeposit' || g.discoveries?.includes('river')),
      );
      const entry = options[Math.floor(random() * options.length)];
      if (!g.discoveries.includes(entry.id)) g.discoveries.push(entry.id);
    }
  }
}

type Tech = {
  activity?: Record<string, number>;
  id: string;
  name: string;
  era: number;
  requires: string[];
  milestones: Record<string, number>;
  description: string;
};
export const technologies: Tech[] = [
  {
    id: 'stoneaxes',
    name: 'Stone axes',
    era: 0,
    requires: [],
    milestones: { wood: 20, tools: 3 },
    activity: { woodcutter: 120 },
    description:
      'Experience gathering wood and making stone tools reveals axes. Each equipped wood gatherer produces twice as much wood. Axes use the stone-tool supply and wear through active use; workers automatically collect deadwood when tools run short.',
  },
  {
    id: 'dwellings',
    name: 'Timber-and-earth dwellings',
    era: 0,
    requires: ['sheltermaking', 'clayworking', 'cordage'],
    milestones: { clay: 5, cord: 5 },
    activity: { shelterbuilder: 200 },
    description:
      'Construction practice reveals stronger dwellings. Builders upgrade shelters using 30 wood, 20 clay and 10 fibres over 100 worker-seconds. Each upgrade adds 2 population spaces; builders fall back to basic shelters when upgrade materials are unavailable.',
  },
  {
    id: 'herdmanagement',
    name: 'Herd management',
    era: 0,
    requires: ['animalkeeping'],
    milestones: {},
    activity: { goatcare: 600 },
    description:
      'Successful care teaches more efficient herd management. Each animal keeper can now tend 6 goats instead of 4.',
  },
  {
    id: 'breeding',
    name: 'Breeding experience',
    era: 0,
    requires: ['herdmanagement'],
    milestones: {},
    activity: { goatgrowth: 2 },
    description:
      'Experience growing a healthy herd improves breeding. Tended goats reproduce 25% faster, within enclosure capacity.',
  },
  {
    id: 'hidepreparation',
    name: 'Hide preparation',
    era: 0,
    requires: [],
    milestones: { hides: 3, tools: 1 },
    description:
      'Experience collecting hides and making basic stone tools reveals how to scrape and prepare coverings. Assign hide workers to supply shelters and clothing.',
  },
  {
    id: 'animalkeeping',
    name: 'Animal keeping',
    era: 0,
    requires: ['agriculture', 'cordage'],
    milestones: {},
    description:
      'Wild goats, farming and a sheltered settlement reveal animal keeping. Build an enclosure from wood and cord, then assign keepers to establish and grow a herd automatically.',
  },
  {
    id: 'clayworking',
    name: 'Clay collection',
    era: 0,
    requires: [],
    milestones: {},
    description:
      'A clay deposit has been found. Assign clay diggers to collect it; working with clay and fire will reveal pottery.',
  },
  {
    id: 'fibres',
    name: 'Plant fibres',
    era: 0,
    requires: [],
    milestones: {},
    description:
      'Your gatherers found fibrous plants. Fibre collectors can gather material for bindings and weaving.',
  },
  {
    id: 'cordage',
    name: 'Cordage',
    era: 0,
    requires: ['fibres'],
    milestones: { fibres: 5 },
    description:
      'Repeated collection reveals how to twist strong cord. Cord makers turn fibres into useful bindings.',
  },
  {
    id: 'stonepoints',
    name: 'Stone points',
    era: 0,
    requires: ['woodworking'],
    milestones: { stone: 5 },
    description:
      'Stone toolmakers learn to shape useful points. This discovery supports spear-making within the existing tool chains.',
  },
  {
    id: 'spearmaking',
    name: 'Stone-tipped spears',
    era: 0,
    requires: ['stonepoints', 'cordage'],
    milestones: { tools: 2, cord: 2 },
    description:
      'Experience with wood, stone points and bindings improves wooden tools into spears. Equipped hunters and fishers now gain 50% food yield instead of 25%, using the same wooden tool supply.',
  },
  {
    id: 'basketry',
    activity: { cordmaker: 90 },
    name: 'Basket weaving',
    era: 0,
    requires: ['cordage'],
    milestones: { cord: 5 },
    description:
      'Practice twisting cord suggests weaving baskets. Basket makers improve gathering and storage using fibres and cord.',
  },
  {
    id: 'netting',
    activity: { fisher: 120 },
    name: 'Fishing nets',
    era: 0,
    requires: ['fishing', 'cordage'],
    milestones: { cord: 8 },
    description:
      'Experience catching fish and working with cordage suggests woven nets. Net makers create equipment that improves fishing more than spears.',
  },
  {
    id: 'sheltermaking',
    name: 'Shelter-making',
    era: 0,
    requires: [],
    milestones: { wood: 3, hides: 1 },
    description:
      'Collected wood and hunting hides reveal shelter-making. Hide workers must prepare the hides before construction. Assign shelter builders to construct automatically; each completed shelter adds 2 population spaces.',
  },
  {
    id: 'woodworking',
    name: 'Basic woodworking',
    era: 0,
    requires: [],
    milestones: { wood: 5 },
    description:
      'Working with wood reveals basic wooden tools, initially sharpened sticks. Assign woodworkers to supply hunters and fishers. Later discoveries improve their benefits; wooden tools last about 20 working seconds.',
  },
  {
    id: 'fishing',
    name: 'Fishing',
    era: 0,
    requires: [],
    milestones: {},
    description:
      'A water source offers another food supply. Assign fishers to catch food continuously. No grain discovery or equipment is required; wooden tools improve catches.',
  },
  {
    id: 'fire',
    name: 'Controlled fire',
    era: 0,
    requires: [],
    milestones: { wood: 25, stone: 10 },
    description:
      'Assign hearth keepers to burn wood for heat. Cooking uses 1 heat/s per food worker and improves food output by up to 20%. Without fuel, ordinary food production continues.',
  },
  {
    id: 'agriculture',
    name: 'Early farming',
    era: 0,
    requires: [],
    milestones: {},
    description:
      'Your people have discovered a wild grain and fresh water. Assign people to the new Farmer node to produce food automatically at 3 food/s per farmer before bonuses, including while you are away. All grain varieties support the same farming profession.',
  },
  {
    id: 'pottery',
    name: 'Pottery',
    era: 0,
    requires: ['fire'],
    milestones: { clay: 5 },
    description:
      'Clay and controlled fire reveal pottery. Potters use clay and 2 heat/s each, sharing available heat with cooking. Each vessel adds 2 storage capacity.',
  },
  {
    id: 'clothing',
    activity: { hideworker: 120 },
    name: 'Hide working',
    era: 0,
    requires: ['fire'],
    milestones: { hides: 30, tools: 20 },
    description:
      'Practice preparing hides reveals how to make durable clothing. Warm clothes improve all work by up to 25%.',
  },
  {
    id: 'community',
    name: 'Village traditions',
    era: 0,
    requires: ['agriculture', 'pottery', 'clothing'],
    milestones: { food: 150, pottery: 35, clothing: 25 },
    description: 'Become a lasting community. Add 5 population capacity.',
  },
];
export const initialState = (): Game => ({
  version: 1,
  discoveries: [],
  randomSeed: Date.now() >>> 0,
  exploration: { gatherer: 0, hunter: 0 },
  stock: Object.fromEntries(Object.keys(resources).map((k) => [k, 0])),
  produced: Object.fromEntries(Object.keys(resources).map((k) => [k, 0])),
  workers: {},
  population: 5,
  tech: [],
  buildings: { home: 0, warehouse: 0 },
  time: 0,
  savedAt: Date.now(),
  paused: true,
});
export function validSave(value: unknown): value is Game {
  if (!value || typeof value !== 'object') return false;
  const g = value as Game;
  const count = (n: unknown) =>
    typeof n === 'number' && Number.isFinite(n) && n >= 0;
  return (
    g.version === 1 &&
    (g.upgradedShelters === undefined ||
      (count(g.upgradedShelters) &&
        Number.isInteger(g.upgradedShelters) &&
        g.upgradedShelters <= (g.shelters || 0))) &&
    (g.dwellingProgress === undefined ||
      (count(g.dwellingProgress) && g.dwellingProgress < 1)) &&
    (g.activity === undefined ||
      (!!g.activity &&
        typeof g.activity === 'object' &&
        !Array.isArray(g.activity) &&
        Object.values(g.activity).every(count))) &&
    (g.herd === undefined ||
      (!!g.herd &&
        count(g.herd.goats) &&
        count(g.herd.establishment) &&
        g.herd.establishment <= 1 &&
        count(g.herd.enclosures) &&
        Number.isInteger(g.herd.enclosures) &&
        count(g.herd.enclosureProgress) &&
        g.herd.enclosureProgress < 1 &&
        g.herd.goats <= g.herd.enclosures * 8)) &&
    (g.shelters === undefined ||
      (count(g.shelters) && Number.isInteger(g.shelters))) &&
    (g.shelterProgress === undefined ||
      (count(g.shelterProgress) && g.shelterProgress < 1)) &&
    (g.discoveries === undefined ||
      (Array.isArray(g.discoveries) &&
        g.discoveries.every((id) => compendium.some((e) => e.id === id)))) &&
    (g.randomSeed === undefined ||
      (Number.isInteger(g.randomSeed) &&
        g.randomSeed >= 0 &&
        g.randomSeed <= 4294967295)) &&
    (g.exploration === undefined ||
      (!!g.exploration &&
        count(g.exploration.gatherer) &&
        count(g.exploration.hunter))) &&
    (g.settings === undefined ||
      (g.settings !== null &&
        typeof g.settings.showHuntingGuide === 'boolean')) &&
    (g.produced === undefined ||
      (!!g.produced &&
        typeof g.produced === 'object' &&
        Object.values(g.produced).every(count))) &&
    count(g.population) &&
    Number.isInteger(g.population) &&
    g.population >= 5 &&
    g.population <= 10000 &&
    typeof g.paused === 'boolean' &&
    count(g.time) &&
    count(g.savedAt) &&
    !!g.stock &&
    Object.keys(resources).every(
      (k) =>
        ([
          'preparedhides',
          'sticks',
          'fibres',
          'cord',
          'points',
          'spears',
          'baskets',
          'nets',
        ].includes(k) &&
          g.stock[k] === undefined) ||
        count(g.stock[k]),
    ) &&
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
export const unlocked = (g: Game, t?: string) =>
  !t ||
  g.tech.includes(t) ||
  (t === 'clayworking' && g.tech.includes('pottery'));
export const housing = (g: Game) =>
  10 +
  (g.shelters || 0) * 2 +
  (g.upgradedShelters || 0) * 2 +
  g.buildings.home * 5 +
  (g.tech.includes('community') ? 5 : 0);
export const capacity = (g: Game, _k: string) =>
  500 +
  g.buildings.warehouse * 500 +
  Math.floor(g.stock.pottery || 0) * 2 +
  Math.floor(g.stock.baskets || 0) * 5;
export const workerCost = (g: Game) =>
  Math.ceil(30 * Math.pow(1.12, g.population - 5));
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
    (id === 'pointmaker' && delta > 0) ||
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
export function discoveryProgress(g: Game, key: string) {
  return (g.produced ?? g.stock)[key] || 0;
}
function discover(g: Game) {
  for (const t of technologies)
    if (
      !g.tech.includes(t.id) &&
      Object.entries(t.activity || {}).every(
        ([job, seconds]) => (g.activity?.[job] || 0) >= seconds,
      ) &&
      (t.id !== 'animalkeeping' ||
        (!!g.discoveries?.includes('wildgoats') && (g.shelters || 0) > 0)) &&
      (t.id !== 'agriculture' || farmingReady(g)) &&
      (t.id !== 'clayworking' ||
        !!g.discoveries?.includes('claydeposit') ||
        g.tech.includes('pottery')) &&
      (t.id !== 'fibres' || !!g.discoveries?.includes('fibreplants')) &&
      (t.id !== 'fishing' ||
        compendium.some(
          (e) =>
            e.category === 'Water sources' && g.discoveries?.includes(e.id),
        )) &&
      t.requires.every((id) => g.tech.includes(id)) &&
      Object.entries(t.milestones).every(
        ([k, v]) => discoveryProgress(g, k) >= v,
      )
    )
      g.tech.push(t.id);
}
export function build(g: Game, k: 'home' | 'warehouse') {
  const n = structuredClone(g);
  if (!pay(n, buildingCost(n, k))) return g;
  n.buildings[k]++;
  return n;
}
export const stoneEfficiency = (g: Game) =>
  Math.min(
    1,
    (g.stock.tools || 0) /
      Math.max(
        1,
        Object.values(g.workers).reduce((a, b) => a + b, 0),
      ),
  );
export function toolReserve(g: Game, resource: string) {
  const users =
    resource === 'sticks'
      ? (g.workers.hunter || 0) + (g.workers.fisher || 0)
      : Object.values(g.workers).reduce((a, b) => a + b, 0);
  return Math.max(5, users * 2);
}
export function heatSupply(g: Game, dt = 1) {
  const cookingDemand = jobs
    .filter((j) => j.group === 'food' && unlocked(g, j.tech))
    .reduce((sum, j) => sum + (g.workers[j.id] || 0), 0);
  const keepers =
    g.tech.includes('fire') && !g.paused && foodBalance(g, false) > 1e-9
      ? g.workers.hearthkeeper || 0
      : 0;
  const wood = Math.min(g.stock.wood || 0, keepers * 0.5 * dt);
  const productivity =
    1 + stoneEfficiency(g) + Math.min(0.25, g.stock.clothing / 200);
  const potteryWork =
    !g.paused && g.tech.includes('pottery') && foodBalance(g, false) > 1e-9
      ? Math.min(
          (g.workers.potter || 0) * productivity,
          (g.stock.clay || 0) / (0.5 * dt),
        )
      : 0;
  const potteryDemand = potteryWork * 2;
  const demand = cookingDemand + potteryDemand;
  const supply = (wood / dt) * 8;
  const used = Math.min(supply, demand);
  return {
    supply,
    demand,
    used,
    wood,
    cookingUsed: demand > 0 ? (used * cookingDemand) / demand : 0,
    potteryUsed: demand > 0 ? (used * potteryDemand) / demand : 0,
    potteryDemand,
    potteryWork: demand > 0 ? (potteryWork * used) / demand : 0,
    bonus: demand > 0 ? (0.2 * used) / demand : 0,
  };
}
export function equipmentUse(g: Game) {
  const available = {
    sticks: (g.stock.sticks || 0) + (g.stock.spears || 0),
    spears: g.stock.spears || 0,
    nets: g.stock.nets || 0,
  };
  const used = { sticks: 0, spears: 0, nets: 0 };
  const byJob: Record<string, Record<string, number>> = {};
  const bonuses: Record<string, number> = {};
  for (const job of ['hunter', 'fisher']) {
    byJob[job] = {};
    const workers = g.workers[job] || 0;
    let remaining = workers,
      gain = 0;
    const types: Array<keyof typeof available> =
      job === 'fisher' ? ['nets', 'sticks'] : ['sticks'];
    for (const type of types) {
      const count = Math.min(remaining, available[type]);
      available[type] -= count;
      used[type] += count;
      byJob[job][type] = count;
      remaining -= count;
      gain +=
        count *
        {
          sticks: g.tech.includes('spearmaking') ? 0.5 : 0.25,
          spears: 0.5,
          nets: 0.75,
        }[type];
    }
    bonuses[job] = workers ? gain / workers : 0;
  }
  return { used, bonuses, byJob };
}
export const stickBonus = (g: Game, job: string) =>
  job === 'gatherer'
    ? Math.min(0.2, (g.stock.baskets || 0) * 0.02)
    : equipmentUse(g).bonuses[job] || 0;
export function woodGathering(g: Game) {
  const workers = g.workers.woodcutter || 0;
  const equipped = g.tech.includes('stoneaxes')
    ? Math.min(workers, g.stock.tools || 0)
    : 0;
  return {
    workers,
    equipped,
    basketBonus: Math.min(0.2, (g.stock.baskets || 0) * 0.02),
    multiplier:
      (workers ? 1 + equipped / workers : 1) *
      (1 + Math.min(0.2, (g.stock.baskets || 0) * 0.02)),
    method:
      equipped === 0
        ? 'Collecting deadwood'
        : equipped >= workers
          ? 'Cutting with stone axes'
          : 'Mixed methods',
  };
}
export function upgradingShelter(g: Game) {
  return (
    g.tech.includes('dwellings') &&
    (g.upgradedShelters || 0) < (g.shelters || 0) &&
    ['wood', 'clay', 'fibres'].every((k) => (g.stock[k] || 0) > 0)
  );
}
export function jobInputs(g: Game, id: string): Record<string, number> {
  return id === 'shelterbuilder' && upgradingShelter(g)
    ? { wood: 0.3, clay: 0.2, fibres: 0.1 }
    : jobs.find((j) => j.id === id)?.input || {};
}
export function herdActivity(g: Game, dt = 1) {
  const herd = g.herd;
  const keepers =
    g.tech.includes('animalkeeping') && !g.paused
      ? g.workers.animalkeeper || 0
      : 0;
  const capacity = (herd?.enclosures || 0) * 8;
  const goats = herd?.goats || 0;
  const tended = Math.min(
    goats,
    keepers * (g.tech.includes('herdmanagement') ? 6 : 4),
  );
  const establishing = goats === 0 && capacity >= 2;
  const feed = establishing ? keepers * 0.2 : tended * 0.1;
  const fraction =
    feed > 0 ? Math.min(1, (g.stock.food || 0) / (feed * dt)) : 0;
  return {
    capacity,
    tended: tended * fraction,
    feed: feed * fraction,
    output: tended * fraction * 0.5,
    effort: establishing ? keepers * fraction : 0,
  };
}
export function foodBalance(g: Game, cooking = true) {
  const cookingBonus = cooking ? heatSupply(g).bonus : 0;
  const bonus = 1 + stoneEfficiency(g) + Math.min(0.25, g.stock.clothing / 200);
  const herd = herdActivity(g);
  let rate = -g.population * 0.15 + herd.output - herd.feed;
  for (const j of jobs)
    if (unlocked(g, j.tech)) {
      const amount =
        (g.workers[j.id] || 0) *
        bonus *
        (j.group === 'food' ? 1 + cookingBonus : 1);
      rate +=
        amount *
        ((j.output.food || 0) * (1 + stickBonus(g, j.id)) -
          (j.input.food || 0));
    }
  return rate;
}
export function waitingForFood(g: Game, id: string) {
  return (
    jobs.find((j) => j.id === id)?.group !== 'food' && foodBalance(g) <= 1e-9
  );
}
function step(
  g: Game,
  dt: number,
  blocked?: string[],
  toolConsumption?: Record<string, number>,
) {
  const wood = woodGathering(g);
  const stoneCoverage = stoneEfficiency(g);
  let stoneWear = 0;
  const animals = herdActivity(g, dt);
  if (g.tech.includes('animalkeeping')) {
    g.herd ??= {
      goats: 0,
      establishment: 0,
      enclosures: 0,
      enclosureProgress: 0,
    };
    g.stock.food = Math.max(0, g.stock.food - animals.feed * dt);
    if (g.workers.animalkeeper && animals.effort === 0 && animals.tended === 0)
      blocked?.push('animalkeeper');
  }
  const equipment = equipmentUse(g);
  const heat = heatSupply(g, dt);
  g.stock.wood -= heat.wood;
  if (g.workers.hearthkeeper && heat.supply < g.workers.hearthkeeper * 4 - 1e-9)
    blocked?.push('hearthkeeper');
  const bonus = 1 + stoneEfficiency(g) + Math.min(0.25, g.stock.clothing / 200);
  const foodReady = foodBalance(g) > 1e-9;
  for (const j of jobs) {
    if (
      j.id === 'thinker' ||
      j.id === 'elder' ||
      j.id === 'hearthkeeper' ||
      j.id === 'animalkeeper'
    )
      continue;
    const workers = g.workers[j.id] || 0;
    if (!workers || !unlocked(g, j.tech)) continue;
    if (j.id === 'gearmaker' || j.id === 'pointmaker') continue;
    const madeTool =
      j.id === 'woodworker' ? 'sticks' : j.id === 'toolmaker' ? 'tools' : null;
    if (madeTool && (g.stock[madeTool] || 0) >= toolReserve(g, madeTool))
      continue;
    if (j.group !== 'food' && !foodReady) {
      blocked?.push(j.id);
      continue;
    }
    let amount =
      workers * dt * bonus * (j.group === 'food' ? 1 + heat.bonus : 1);
    const upgrading = j.id === 'shelterbuilder' && upgradingShelter(g);
    const inputs = jobInputs(g, j.id);
    if (upgrading)
      amount = Math.min(amount, (1 - (g.dwellingProgress || 0)) * 100);
    if (j.id === 'potter') {
      if (heat.potteryWork < workers * bonus - 1e-9) blocked?.push(j.id);
      amount = heat.potteryWork * dt;
    }
    let fraction = 1;
    for (const [k, v] of Object.entries(inputs))
      fraction = Math.min(fraction, (g.stock[k] || 0) / (v * amount));
    if (fraction < 0.999) blocked?.push(j.id);
    amount *= Math.max(0, fraction);
    const activeWorkerTime =
      amount / (bonus * (j.group === 'food' ? 1 + heat.bonus : 1));
    const coverage =
      j.id === 'woodcutter' && g.tech.includes('stoneaxes')
        ? Math.max(stoneCoverage, workers ? wood.equipped / workers : 0)
        : stoneCoverage;
    const wear = (activeWorkerTime * coverage) / 20;
    stoneWear += wear;
    if (toolConsumption) toolConsumption[j.id] = wear / dt;
    // Record productive worker-time, excluding output bonuses and blocked work.
    g.activity ??= {};
    g.activity[j.id] =
      (g.activity[j.id] || 0) + workers * dt * Math.max(0, fraction);
    explore(g, j.id, amount);
    for (const [k, v] of Object.entries(inputs))
      g.stock[k] = Math.max(0, g.stock[k] - v * amount);
    for (const [k, v] of Object.entries(j.output)) {
      const output =
        v *
        amount *
        (k === 'food' ? 1 + stickBonus(g, j.id) : 1) *
        (j.id === 'woodcutter' && k === 'wood' ? wood.multiplier : 1);
      if (k === 'enclosures') {
        g.herd ??= {
          goats: 0,
          establishment: 0,
          enclosures: 0,
          enclosureProgress: 0,
        };
        const progress = g.herd.enclosureProgress + output;
        const completed = Math.floor(progress + 1e-9);
        g.herd.enclosures += completed;
        g.herd.enclosureProgress = Math.max(0, progress - completed);
        continue;
      }
      if (k === 'shelters') {
        if (upgrading) {
          const progress = (g.dwellingProgress || 0) + output;
          const completed = Math.floor(progress + 1e-9);
          g.upgradedShelters = (g.upgradedShelters || 0) + completed;
          g.dwellingProgress = Math.max(0, progress - completed);
          continue;
        }
        const progress = (g.shelterProgress || 0) + output;
        const completed = Math.floor(progress + 1e-9);
        g.shelters = (g.shelters || 0) + completed;
        g.shelterProgress = Math.max(0, progress - completed);
        continue;
      }
      g.stock[k] = Math.min(capacity(g, k), (g.stock[k] || 0) + output);
      if (g.produced) g.produced[k] = (g.produced[k] || 0) + output;
    }
  }
  g.stock.food = Math.max(0, g.stock.food - g.population * 0.15 * dt);
  for (const [key, count] of Object.entries(equipment.used))
    g.stock[key] = Math.max(
      0,
      (g.stock[key] || 0) - (count * dt) / (key === 'sticks' ? 20 : 1000),
    );
  g.stock.tools = Math.max(0, g.stock.tools - stoneWear);
  if (g.herd) {
    g.activity ??= {};
    g.activity.goatcare = (g.activity.goatcare || 0) + animals.tended * dt;
    g.stock.food = Math.min(
      capacity(g, 'food'),
      g.stock.food + animals.output * dt,
    );
    if (g.produced)
      g.produced.food = (g.produced.food || 0) + animals.output * dt;
    if (g.herd.goats === 0) {
      g.herd.establishment = Math.min(
        1,
        g.herd.establishment + (animals.effort * dt) / 100,
      );
      if (g.herd.establishment >= 1 - 1e-9 && animals.capacity >= 2) {
        g.herd.establishment = 1;
        g.herd.goats = 2;
      }
    } else {
      const previousGoats = g.herd.goats;
      g.herd.goats = Math.min(
        animals.capacity,
        g.herd.goats +
          ((animals.tended * dt) / 600) *
            (g.tech.includes('breeding') ? 1.25 : 1),
      );
      g.activity.goatgrowth =
        (g.activity.goatgrowth || 0) +
        Math.max(0, g.herd.goats - previousGoats);
    }
  }
  g.time += dt;
  discover(g);
}
export function advance(g: Game, seconds: number) {
  // Retain legacy saves while merging stone-point stock and labour into tools.
  if (g.stock.points || g.workers.pointmaker)
    g = {
      ...g,
      stock: {
        ...g.stock,
        tools: (g.stock.tools || 0) + (g.stock.points || 0),
        points: 0,
      },
      produced: {
        ...(g.produced || g.stock),
        tools:
          ((g.produced || g.stock).tools || 0) +
          Math.max(g.produced?.points || 0, g.stock.points || 0),
        points: 0,
      },
      workers: {
        ...g.workers,
        toolmaker: (g.workers.toolmaker || 0) + (g.workers.pointmaker || 0),
        pointmaker: 0,
      },
    };
  // Preserve old spear stock and assigned craftspeople in the unified tool chain.
  if (g.stock.spears || g.workers.gearmaker)
    g = {
      ...g,
      stock: {
        ...g.stock,
        sticks: (g.stock.sticks || 0) + (g.stock.spears || 0),
        spears: 0,
      },
      workers: {
        ...g.workers,
        woodworker: (g.workers.woodworker || 0) + (g.workers.gearmaker || 0),
        gearmaker: 0,
      },
    };
  if (Object.keys(resources).some((k) => g.stock[k] === undefined))
    g = {
      ...g,
      stock: {
        ...Object.fromEntries(Object.keys(resources).map((k) => [k, 0])),
        ...g.stock,
      },
    };
  if (g.stock.sticks === undefined)
    g = { ...g, stock: { ...g.stock, sticks: 0 } };
  if (g.workers.thinker || g.workers.elder)
    g = { ...g, workers: { ...g.workers, thinker: 0, elder: 0 } };
  if (g.paused || !Number.isFinite(seconds) || seconds <= 0) return g;
  const n = structuredClone(g);
  n.produced ??= { ...n.stock };
  let remaining = Math.min(seconds, 28800);
  while (remaining > 0) {
    const dt = Math.min(1, remaining);
    step(n, dt);
    if (n.settings?.autoGrowth !== false)
      while (n.population < housing(n) && n.stock.food >= workerCost(n)) {
        n.stock.food -= workerCost(n);
        n.population++;
      }
    remaining -= dt;
  }
  return n;
}
export function ratePreview(g: Game) {
  const toolConsumption: Record<string, number> = {};
  const n = structuredClone(g),
    blocked: string[] = [];
  if (!g.paused) step(n, 1, blocked, toolConsumption);
  return {
    rates: Object.fromEntries(
      Object.keys(resources).map((k) => [
        k,
        (n.stock[k] || 0) - (g.stock[k] || 0),
      ]),
    ),
    blocked,
    toolConsumption,
  };
}

// One visibility rule for the map, stockpile and connection details.
export function visibleConcepts(g: Game): Set<string> {
  const seen = (key: string) =>
    Math.max(discoveryProgress(g, key), g.stock[key] || 0);
  const visible = new Set(['population', 'food', 'gatherer', 'hunter']);
  if (seen('hides') > 0) visible.add('hides');
  if (seen('wood') > 0) visible.add('wood');
  if (seen('wood') >= 5) visible.add('woodcutter');
  // A food supply makes exploration possible; the first materials lead to tools.
  if (seen('food') >= 10 || g.tech.length > 0) {
    for (const id of ['knapper', 'stone']) visible.add(id);
  }
  if ((seen('wood') >= 5 && seen('stone') >= 5) || seen('tools') > 0) {
    visible.add('toolmaker');
    visible.add('tools');
  }

  for (const job of jobs) {
    if (job.tech && unlocked(g, job.tech)) {
      visible.add(job.id);
      for (const key of Object.keys(job.output)) visible.add(key);
    }
    // Preserve work and resources already revealed in older settlements.
    if (
      (g.workers[job.id] || 0) > 0 &&
      !['hunter', 'gatherer'].includes(job.id)
    ) {
      visible.add(job.id);
      for (const key of Object.keys(job.output)) visible.add(key);
    }
  }
  visible.delete('knowledge');
  visible.delete('thinker');
  visible.delete('elder');
  visible.delete('spears');
  visible.delete('gearmaker');
  visible.delete('pointmaker');
  visible.delete('points');
  if (g.tech.includes('animalkeeping')) {
    visible.add('enclosures');
    visible.add('goats');
  }
  if (g.tech.includes('fire')) {
    visible.add('heat');
    visible.add('cooking');
  }
  return visible;
}

export function restartGame(g: Game): Game {
  const fresh = initialState();
  if (g.settings) fresh.settings = { ...g.settings };
  return fresh;
}

export function settlementNeeds(g: Game): { node: string; message: string }[] {
  const visible = visibleConcepts(g);
  const needs: { node: string; message: string }[] = [];
  const add = (node: string, message: string) => {
    if (visible.has(node)) needs.push({ node, message });
  };
  const idle =
    g.population - Object.values(g.workers).reduce((a, b) => a + b, 0);
  if (idle > 0)
    add(
      'population',
      `${idle} ${idle === 1 ? 'person is' : 'people are'} unassigned.`,
    );
  if (g.population >= housing(g))
    add(
      visible.has('shelterbuilder') ? 'shelterbuilder' : 'population',
      visible.has('shelterbuilder')
        ? 'Population capacity reached—assign shelter builders.'
        : 'Your camp has reached its population capacity.',
    );
  if (g.paused) return needs;
  const { blocked } = ratePreview(g);
  for (const job of jobs) {
    if (!visible.has(job.id) || !g.workers[job.id] || !blocked.includes(job.id))
      continue;
    if (waitingForFood(g, job.id)) {
      if (!needs.some((n) => n.node === 'food'))
        add(
          'food',
          'Some workers need positive food production—assign hunters or gatherers.',
        );
      continue;
    }
    if (job.id === 'potter') {
      const heat = heatSupply(g);
      if (heat.potteryUsed + 1e-9 < heat.potteryDemand) {
        add('heat', 'Potters need more heat—check hearth keepers and wood.');
        continue;
      }
    }
    if (job.id === 'animalkeeper') {
      add(
        job.id,
        (g.herd?.enclosures || 0) === 0
          ? 'Animal keepers need an enclosure before establishing a herd.'
          : 'Animal keepers need stored food to tend the herd.',
      );
      continue;
    }
    const materials = Object.keys(jobInputs(g, job.id)).filter((k) =>
      visible.has(k),
    );
    add(
      job.id,
      `${job.name}: short of ${materials.map((k) => resources[k]?.name.toLowerCase() || k).join(' or ') || 'supplies'}.`,
    );
  }
  const equipment = equipmentUse(g);
  for (const job of ['hunter', 'fisher']) {
    if (!visible.has(job) || !g.workers[job]) continue;
    const better =
      job === 'fisher' && visible.has('nets')
        ? 'nets'
        : visible.has('spears')
          ? 'spears'
          : visible.has('sticks')
            ? 'sticks'
            : null;
    if (!better) continue;
    const targetBonus =
      better === 'nets' ? 0.75 : g.tech.includes('spearmaking') ? 0.5 : 0.25;
    if ((equipment.bonuses[job] || 0) + 1e-9 < targetBonus)
      add(
        better,
        `${job === 'fisher' ? 'Fishers' : 'Hunters'} could use more ${resources[better].name.toLowerCase()}.`,
      );
  }
  return needs;
}
