import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  initialState as pausedInitialState,
  assign,
  recruit,
  advance,
  build,
  capacity,
  validSave,
  jobs,
  technologies,
} from '../lib/game.ts';
// Simulation tests explicitly start the clock; actual new games begin paused.
const initialState = () => ({ ...pausedInitialState(), paused: false });
test('assignments preserve population and prevent locked or negative jobs', () => {
  let g = initialState();
  g = assign(g, 'thinker', 5);
  assert.equal(assign(g, 'hunter', 1), g);
  assert.equal(assign(g, 'farmer', 1), g);
  assert.equal(assign(g, 'hunter', -1), g);
  g = assign(g, 'thinker', -2);
  g = assign(g, 'woodcutter', 2);
  assert.equal(
    Object.values(g.workers).reduce((a, b) => a + b),
    5,
  );
});
test('recruitment spends food once and respects housing', () => {
  let g = initialState();
  g.stock.food = 35;
  g = recruit(g);
  assert.equal(g.population, 6);
  assert.equal(g.stock.food, 5);
  assert.equal(recruit(g), g);
  g.population = 10;
  g.stock.food = 500;
  assert.equal(recruit(g), g);
});
test('processing stops without inputs, never produces negative stocks', () => {
  let g = initialState();
  g.settings = { showHuntingGuide: true, autoGrowth: false };
  g.workers = { hunter: 1, toolmaker: 4 };
  g.stock.food = 100;
  g = advance(g, 30);
  assert.equal(g.stock.tools, 0);
  g.stock.wood = 1;
  g.stock.stone = 1;
  g = advance(g, 30);
  assert.ok(g.stock.tools > 0);
  for (const v of Object.values(g.stock))
    assert.ok(v >= 0 && Number.isFinite(v));
});
test('offline simulation equals live steps and caps at eight hours', () => {
  const g = initialState();
  g.workers = {
    hunter: 1,
    woodcutter: 1,
    knapper: 1,
    toolmaker: 1,
    gatherer: 1,
  };
  let live = g;
  for (let i = 0; i < 600; i++) live = advance(live, 1);
  assert.deepEqual(advance(g, 600), live);
  assert.equal(advance(g, 999999).time, 28800);
});
test('pause prevents offline production', () => {
  const g = initialState();
  g.paused = true;
  assert.equal(advance(g, 100), g);
});
test('discoveries unlock automatically without consuming stock', () => {
  const g = initialState();
  g.workers = {};
  g.produced = { knowledge: 100, wood: 100, stone: 100, tools: 0 };
  g.stock.wood = 7;
  const n = advance(g, 1);
  assert.ok(n.tech.includes('fire'));
  assert.ok(!n.tech.includes('agriculture'));
  assert.equal(n.stock.wood, 7);
  assert.equal(n.produced.wood, 100);
  assert.equal(advance(n, 1).tech.filter((t) => t === 'fire').length, 1);
});
test('older saves keep discoveries and seed progress from existing stock', () => {
  const g = initialState();
  delete g.produced;
  g.tech = ['fire'];
  g.stock.tools = 30;
  assert.ok(validSave(g));
  const n = advance(g, 1);
  assert.equal(n.produced.tools, 30);
  assert.ok(n.tech.includes('fire'));
});
test('pottery and storage expand capacity; all technologies remain in first era', () => {
  let g = initialState();
  g.stock.wood = 200;
  g.stock.stone = 100;
  g = build(g, 'warehouse');
  assert.equal(capacity(g, 'food'), 1000);
  g.stock.pottery = 20;
  assert.equal(capacity(g, 'food'), 1040);
  assert.ok(technologies.every((t) => t.era === 0));
});
test('malformed saves rejected', () => {
  assert.ok(validSave(initialState()));
  assert.equal(validSave({ version: 1 }), false);
  const g = initialState();
  g.workers.gatherer = NaN;
  assert.equal(validSave(g), false);
});
test('all first-era discoveries reachable through actual production', () => {
  let g = initialState();
  g.randomSeed = 123456789;
  g.population = 10;
  g.workers = {
    gatherer: 1,
    woodcutter: 2,
    knapper: 2,
    toolmaker: 1,
    hunter: 3,
  };
  g = advance(g, 300);
  assert.ok(g.tech.includes('fire'));
  g = advance(g, 300);
  assert.ok(g.tech.includes('stonepoints'));
  g.workers = {
    farmer: 1,
    hideworker: 1,
    woodcutter: 1,
    knapper: 1,
    toolmaker: 1,
    hearthkeeper: 1,
    hunter: 1,
    claydigger: 1,
    potter: 1,
    tanner: 1,
  };
  g = advance(g, 600);
  g.workers = { hunter: 2, fibrecollector: 2, pointmaker: 1, cordmaker: 0 };
  g = advance(g, 100);
  g.workers.cordmaker = 2;
  g = advance(g, 300);
  g.workers = { hunter: 2, fisher: 1, shelterbuilder: 1, woodcutter: 1 };
  g = advance(g, 300);
  g.workers = { farmer: 2, woodcutter: 1, enclosurebuilder: 1, animalkeeper: 1 };
  g = advance(g, 2000);
  assert.equal(g.tech.length, technologies.length);
  assert.ok(validSave(g));
});

test('undiscovered concepts stay hidden until their discovery unlocks', async () => {
  const { visibleConcepts } = await import('../lib/game.ts');
  const g = initialState();
  let visible = visibleConcepts(g);
  for (const id of [
    'farmer',
    'claydigger',
    'clay',
    'potter',
    'pottery',
    'tanner',
    'clothing',
    'elder',
  ])
    assert.equal(visible.has(id), false, id);
  for (const id of ['hunter', 'gatherer', 'food', 'population'])
    assert.equal(visible.has(id), true, id);
  g.tech = ['fire', 'pottery'];
  visible = visibleConcepts(g);
  for (const id of ['claydigger', 'clay', 'potter', 'pottery'])
    assert.ok(visible.has(id));
  assert.equal(visible.has('tanner'), false);
});

test('restart resets the entire village and preserves only preferences', async () => {
  const { restartGame } = await import('../lib/game.ts');
  const g = initialState();
  g.stock.food = 450;
  g.population = 20;
  g.tech = ['fire', 'pottery'];
  g.buildings.home = 5;
  g.time = 999;
  g.produced.tools = 400;
  g.paused = true;
  g.settings = { showHuntingGuide: false };
  const fresh = restartGame(g);
  assert.equal(fresh.population, 5);
  assert.equal(fresh.stock.food, 0);
  assert.deepEqual(fresh.tech, []);
  assert.deepEqual(fresh.buildings, { home: 0, warehouse: 0 });
  assert.equal(fresh.time, 0);
  assert.equal(fresh.paused, true);
  assert.equal(fresh.produced.tools, 0);
  assert.deepEqual(fresh.workers, {});
  assert.equal(fresh.settings.showHuntingGuide, false);
  assert.ok(validSave(fresh));
  assert.equal(g.population, 20);
});

test('new villages produce no food until someone is assigned', () => {
  const g = initialState();
  assert.deepEqual(g.workers, {});
  const idle = advance(g, 10);
  assert.equal(idle.produced.food, 0);
  assert.equal(idle.stock.food, 0);
  for (const job of ['gatherer', 'hunter']) {
    const working = advance(assign(g, job, 1), 10);
    assert.ok(working.produced.food > 0);
    assert.ok(working.stock.food > g.stock.food);
  }
});

test('non-food jobs wait for positive food balance, regardless of stock', async () => {
  const { foodBalance } = await import('../lib/game.ts');
  let g = initialState();
  g.workers = { woodcutter: 1 };
  g.stock.food = 100;
  assert.equal(advance(g, 10).stock.wood, 0);
  g.stock.food = 0;
  g.workers.hunter = 1;
  assert.ok(foodBalance(g) > 0);
  const active = advance(g, 1);
  assert.equal(active.stock.wood, 0.5);
  assert.equal(active.population, 5);
  g.population = 8;
  g.workers = { hunter: 1, woodcutter: 1 };
  assert.ok(Math.abs(foodBalance(g)) < 1e-9);
  assert.equal(advance(g, 10).stock.wood, 0);
});

test('opening has exactly four nodes and hides require actual hunting output', async () => {
  const { visibleConcepts } = await import('../lib/game.ts');
  const g = initialState();
  assert.deepEqual([...visibleConcepts(g)].sort(), [
    'food',
    'gatherer',
    'hunter',
    'population',
  ]);
  const assigned = assign(g, 'hunter', 1);
  assert.equal(visibleConcepts(assigned).has('hides'), false);
  const worked = advance(assigned, 1);
  assert.ok(visibleConcepts(worked).has('hides'));
  const stopped = assign(worked, 'hunter', -1);
  stopped.stock.hides = 0;
  assert.ok(visibleConcepts(stopped).has('hides'));
  const gathered = advance(assign(g, 'gatherer', 1), 1);
  assert.equal(visibleConcepts(gathered).has('hides'), false);
});
test('visible opening jobs reveal materials and toolmaking without a progression deadlock', async () => {
  const { visibleConcepts } = await import('../lib/game.ts');
  let start = initialState();
  start.randomSeed = 123456789;
  let g = advance(assign(start, 'gatherer', 1), 180);
  assert.ok(visibleConcepts(g).has('woodcutter'));
  assert.ok(visibleConcepts(g).has('knapper'));
  g = assign(g, 'woodcutter', 1);
  g = assign(g, 'knapper', 1);
  g = advance(g, 10);
  assert.ok(visibleConcepts(g).has('toolmaker'));
});

test('farming needs a wild grain and fresh water, with no fire or knowledge requirement', async () => {
  const { farmingReady } = await import('../lib/game.ts');
  for (const discoveries of [[], ['rice'], ['spring'], ['berries', 'river']]) {
    const g = initialState();
    g.discoveries = discoveries;
    assert.equal(farmingReady(g), false);
    assert.equal(advance(g, 1).tech.includes('agriculture'), false);
  }
  const g = initialState();
  g.discoveries = ['rice', 'spring'];
  assert.ok(farmingReady(g));
  assert.ok(advance(g, 1).tech.includes('agriculture'));
});
test('exploration finds are job-specific, persistent, unique and reproducible offline', async () => {
  const { compendium } = await import('../lib/game.ts');
  for (const job of ['gatherer', 'hunter']) {
    const g = initialState();
    g.randomSeed = 123456789;
    g.workers = { [job]: 1 };
    let live = g;
    for (let i = 0; i < 600; i++) live = advance(live, 1);
    const offline = advance(g, 600);
    assert.deepEqual(offline, live);
    assert.ok(offline.discoveries.length > 0);
    assert.equal(new Set(offline.discoveries).size, offline.discoveries.length);
    assert.ok(
      offline.discoveries.every(
        (id) => compendium.find((e) => e.id === id).job === job,
      ),
    );
    assert.ok(validSave(JSON.parse(JSON.stringify(offline))));
  }
  const idle = advance(initialState(), 600);
  assert.deepEqual(idle.discoveries, []);
});
test('knowledge and its specialists never appear on the map', async () => {
  const { visibleConcepts } = await import('../lib/game.ts');
  const g = initialState();
  g.tech = technologies.map((t) => t.id);
  g.stock.knowledge = 100;
  g.workers.thinker = 1;
  const migrated = advance(g, 1);
  assert.equal(migrated.workers.thinker, 0);
  for (const id of ['knowledge', 'thinker', 'elder'])
    assert.equal(visibleConcepts(migrated).has(id), false);
});

test('fallen branches reveal wood before the collector; spending wood keeps it revealed', async () => {
  const { visibleConcepts } = await import('../lib/game.ts');
  let g = initialState();
  g.randomSeed = 123456789;
  g.workers = { gatherer: 1 };
  let first;
  for (let i = 0; i < 1000 && !first; i++) {
    g = advance(g, 1);
    if (g.produced.wood > 0) first = structuredClone(g);
  }
  assert.ok(first);
  assert.equal(first.produced.wood, 1);
  assert.ok(visibleConcepts(first).has('wood'));
  assert.equal(visibleConcepts(first).has('woodcutter'), false);
  assert.ok(first.discoveries.includes('fallen-branches'));
  g = advance(g, 1000);
  assert.ok(visibleConcepts(g).has('woodcutter'));
  g.stock.wood = 0;
  assert.ok(visibleConcepts(g).has('woodcutter'));
  const hunt = initialState();
  hunt.randomSeed = 123456789;
  hunt.workers = { hunter: 1 };
  const hunted = advance(hunt, 1000);
  assert.equal(hunted.produced.wood, 0);
  assert.equal(visibleConcepts(hunted).has('woodcutter'), false);
});

test('automatic growth spends increasing thresholds, retains excess and leaves people unassigned', () => {
  const g = initialState();
  g.stock.food = 66;
  const next = advance(g, 1);
  assert.equal(next.population, 7);
  assert.ok(Math.abs(next.stock.food - 1.25) < 1e-8);
  assert.deepEqual(next.workers, g.workers);
  assert.equal(g.population, 5);
});

test('automatic growth respects threshold, pause setting and population capacity', () => {
  const g = initialState();
  g.stock.food = 19;
  assert.equal(advance(g, 1).population, 5);
  g.stock.food = 100;
  g.settings = { showHuntingGuide: true, autoGrowth: false };
  assert.equal(advance(g, 1).population, 5);
  g.settings.autoGrowth = true;
  g.population = 10;
  assert.equal(advance(g, 1).population, 10);
  assert.equal(advance(g, 1).stock.food, 98.5);
});

test('every wild grain and freshwater source unlocks the same automatic food farming', async () => {
  const { visibleConcepts, ratePreview } = await import('../lib/game.ts');
  for (const grain of ['rice', 'wheat', 'barley']) {
    for (const water of ['spring', 'river']) {
      let g = initialState();
      assert.equal(visibleConcepts(g).has('farmer'), false);
      g.discoveries = [grain, water];
      g.settings = { showHuntingGuide: true, autoGrowth: false };
      g = advance(g, 1);
      assert.equal(visibleConcepts(g).has('farmer'), true);
      g = assign(g, 'farmer', 1);
      assert.equal(g.workers.farmer, 1);
      assert.equal(ratePreview(g).rates.food, 2.25);
      const offline = advance(g, 60);
      assert.equal(offline.stock.food, 135);
      assert.deepEqual(offline.discoveries, [grain, water]);
      let live = g;
      for (let second = 0; second < 60; second++) live = advance(live, 1);
      assert.deepEqual(offline.stock, live.stock);
      const stopped = assign(offline, 'farmer', -1);
      assert.equal(ratePreview(stopped).rates.food, -0.75);
    }
  }
});

test('custom node layouts survive save reload and simulation without changing production', () => {
  const g = initialState();
  g.nodePositions = { food: { x: 420, y: 240 }, hunter: { x: 720, y: 510 } };
  const loaded = JSON.parse(JSON.stringify(g));
  assert.equal(validSave(loaded), true);
  assert.deepEqual(advance(loaded, 10).nodePositions, g.nodePositions);
  const plain = initialState();
  plain.randomSeed = g.randomSeed;
  assert.deepEqual(advance(loaded, 10).stock, advance(plain, 10).stock);
});

test('hearths consume wood for live heat and cooking scales with fuel', async () => {
  const { heatSupply } = await import('../lib/game.ts');
  const g = initialState();
  g.tech = ['fire'];
  g.workers = { hunter: 1, hearthkeeper: 1 };
  g.settings = { showHuntingGuide: true, autoGrowth: false };
  g.stock.wood = 1;
  assert.equal(heatSupply(g).supply, 4);
  assert.equal(heatSupply(g).used, 1);
  const hot = advance(g, 1);
  assert.equal(hot.stock.wood, 0.5);
  assert.ok(Math.abs(hot.stock.food - 0.69) < 1e-8);
  g.stock.wood = 0;
  const cold = advance(g, 1);
  assert.ok(Math.abs(cold.stock.food - 0.45) < 1e-8);
  g.stock.wood = 0.0625;
  assert.equal(heatSupply(g).bonus, 0.1);
  assert.equal(advance(g, 1).stock.wood, 0);
  assert.equal('heat' in hot.stock, false);
  g.stock.wood = 10;
  let live = g;
  for (let i = 0; i < 30; i++) live = advance(live, 1);
  assert.deepEqual(advance(g, 30), live);
  g.workers = { hearthkeeper: 1 };
  assert.equal(heatSupply(g).supply, 0);
  assert.equal(advance(g, 1).stock.wood, 10);
});


test('water alone reveals fishing and equipment wears only through use', async () => {
  const { visibleConcepts } = await import('../lib/game.ts');
  for (const source of ['spring', 'river']) {
    let g = initialState();
    assert.equal(visibleConcepts(g).has('fisher'), false);
    g.discoveries = [source];
    g = advance(g, 1);
    assert.ok(g.tech.includes('fishing'));
    assert.ok(!g.tech.includes('agriculture'));
    g = assign(g, 'fisher', 1);
    const bare = advance(g, 1);
    assert.equal(bare.stock.food, 0.75);
    g.stock.sticks = 50;
    const equipped = advance(g, 1);
    assert.equal(equipped.stock.food, 1.125);
    assert.equal(equipped.stock.sticks, 49.95);
  }
});

test('woodworking unlocks from wood, needs fuel materials and supports legacy saves', () => {
  let g = initialState();
  delete g.stock.sticks;
  assert.ok(validSave(g));
  g = advance(g, 1);
  assert.equal(g.stock.sticks, 0);
  g.produced.wood = 5;
  g = advance(g, 1);
  assert.ok(g.tech.includes('woodworking'));
  g = assign(assign(g, 'hunter', 1), 'woodworker', 1);
  assert.equal(advance(g, 1).stock.sticks, 0);
  g.stock.wood = 1;
  const next = advance(g, 1);
  assert.equal(next.stock.sticks, 0.4);
  assert.equal(next.stock.wood, 0.6);
  let live = g;
  for (let i = 0; i < 30; i++) live = advance(live, 1);
  assert.deepEqual(advance(g, 30), live);
});

test('shelters unlock early and builders automatically add permanent capacity', async () => {
  const { housing, visibleConcepts, restartGame } = await import('../lib/game.ts');
  let g = initialState();
  assert.equal(visibleConcepts(g).has('shelters'), false);
  g.produced.wood = 3;
  g.produced.hides = 1;
  g = advance(g, 1);
  assert.ok(visibleConcepts(g).has('shelterbuilder'));
  g.settings = { showHuntingGuide: true, autoGrowth: false };
  g.workers = { gatherer: 1, shelterbuilder: 1 };
  // Seed produces no incidental wood during this single step.
  g.randomSeed = 123456789;
  g.stock.wood = 20;
  g.stock.preparedhides = 10;
  const first = advance(g, 1);
  assert.equal(first.shelterProgress, 0.01);
  assert.equal(first.stock.wood, 19.8);
  assert.equal(first.stock.preparedhides, 9.9);
  const built = advance(g, 100);
  assert.equal(built.shelters, 1);
  assert.equal(housing(built), 12);
  assert.ok(validSave(JSON.parse(JSON.stringify(built))));
  let live = g;
  for (let i = 0; i < 100; i++) live = advance(live, 1);
  assert.deepEqual(built, live);
  built.stock.preparedhides = 0;
  const stopped = advance(built, 10);
  assert.equal(stopped.shelterProgress, built.shelterProgress);
  assert.equal(housing(stopped), 12);
  assert.equal(housing(restartGame(stopped)), 10);
});


test('equipment allocates without double counting, favours upgrades, and wears only active gear', async () => {
  const { equipmentUse } = await import('../lib/game.ts');
  const g = initialState();
  g.tech = ['fishing'];
  g.workers = { hunter: 2, fisher: 2 };
  g.stock.sticks = 10; g.stock.spears = 2; g.stock.nets = 1;
  const use = equipmentUse(g);
  assert.deepEqual(use.used, { sticks: 3, spears: 0, nets: 1 });
  assert.equal(use.bonuses.hunter, 0.25);
  assert.equal(use.bonuses.fisher, 0.5);
  const next = advance(g, 1);
  assert.equal(next.stock.sticks, 11.85);
  assert.equal(next.stock.spears, 0);
  assert.equal(next.stock.nets, 0.999);
  g.workers = {};
  assert.equal(advance(g, 10).stock.sticks, 12);
});

test('new production chains, basket storage and legacy resource migration', async () => {
  const { stickBonus } = await import('../lib/game.ts');
  let g = initialState();
  g.discoveries = ['fibreplants'];
  g = advance(g, 1);
  assert.ok(g.tech.includes('fibres'));
  g.workers = { hunter: 2, fibrecollector: 1 };
  g = advance(g, 10);
  assert.ok(g.tech.includes('cordage'));
  g.workers.cordmaker = 1;
  g = advance(g, 100);
  assert.ok(g.stock.cord > 0);
  assert.ok(g.tech.includes('basketry'));
  g.workers.basketmaker = 1;
  const built = advance(g, 30);
  assert.ok(built.stock.baskets > 0);
  assert.ok(capacity(built, 'food') > 500);
  assert.ok(stickBonus(built, 'gatherer') > 0);
  for (const k of ['fibres','cord','points','spears','baskets','nets']) delete g.stock[k];
  assert.ok(validSave(g));
  g.paused = true;
  const restored = advance(g, 1);
  assert.equal(restored.stock.cord, 0);
});



test('clay is found only after a river and pottery needs clay plus fire', async () => {
  let g = initialState();
  g.randomSeed = 123456789;
  g.workers.hunter = 1;
  let sawClay = false;
  for (let i = 0; i < 4000 && !sawClay; i++) {
    const next = advance(g, 1);
    if (next.discoveries.includes('claydeposit')) {
      assert.ok(g.discoveries.includes('river'));
      sawClay = true;
    }
    g = next;
  }
  assert.ok(sawClay);
  assert.ok(g.tech.includes('clayworking'));
  assert.ok(!g.tech.includes('pottery'));
  g.tech.push('fire');
  g.produced.clay = 5;
  assert.ok(advance(g, 1).tech.includes('pottery'));
});

test('pottery shares heat proportionally, stops without fuel and preserves clay', async () => {
  const { heatSupply } = await import('../lib/game.ts');
  const g = initialState();
  g.tech = ['fire','pottery'];
  g.workers = { hunter: 1, potter: 2, hearthkeeper: 1 };
  g.stock.wood = 10; g.stock.clay = 10;
  const heat = heatSupply(g);
  assert.equal(heat.demand, 5);
  assert.equal(heat.cookingUsed, 0.8);
  assert.equal(heat.potteryUsed, 3.2);
  const next = advance(g, 1);
  assert.ok(Math.abs(next.stock.pottery - 0.56) < 1e-8);
  assert.ok(Math.abs(next.stock.clay - 9.2) < 1e-8);
  assert.equal(next.stock.wood, 9.5);
  g.stock.wood = 0;
  assert.equal(advance(g, 1).stock.pottery, 0);
  assert.equal(advance(g, 1).stock.clay, 10);
  g.stock.wood = 10;
  let live = g;
  for (let i = 0; i < 30; i++) live = advance(live, 1);
  assert.deepEqual(advance(g, 30), live);
  assert.ok(validSave(g));
});



test('animal keeping requires goats, farming, cordage and a completed shelter', () => {
  const g = initialState();
  g.tech = ['agriculture','cordage'];
  g.discoveries = ['deer','wildboar'];
  g.shelters = 1;
  assert.ok(!advance(g, 1).tech.includes('animalkeeping'));
  g.discoveries.push('wildgoats');
  g.shelters = 0;
  assert.ok(!advance(g, 1).tech.includes('animalkeeping'));
  g.shelters = 1;
  assert.ok(advance(g, 1).tech.includes('animalkeeping'));
});

test('enclosures and herds establish automatically, grow within capacity, and survive shortages', async () => {
  const { herdActivity, restartGame } = await import('../lib/game.ts');
  let g = initialState();
  g.tech = ['animalkeeping'];
  g.settings = { showHuntingGuide: true, autoGrowth: false };
  g.workers = { hunter: 2, enclosurebuilder: 1 };
  g.stock.wood = 20; g.stock.cord = 10;
  g = advance(g, 100);
  assert.equal(g.herd.enclosures, 1);
  assert.equal(g.herd.goats, 0);
  g.workers = { hunter: 2, animalkeeper: 1 };
  g = advance(g, 100);
  assert.ok(g.herd.goats >= 2);
  assert.equal(g.herd.establishment, 1);
  assert.ok(herdActivity(g).output > herdActivity(g).feed);
  let live = g;
  for (let i = 0; i < 120; i++) live = advance(live, 1);
  assert.deepEqual(advance(g, 120), live);
  g = advance(g, 2000);
  assert.ok(g.herd.goats <= 8);
  const goats = g.herd.goats;
  g.workers = {};
  g.stock.food = 0;
  const stopped = advance(g, 100);
  assert.equal(stopped.herd.goats, goats);
  assert.equal(stopped.stock.food, 0);
  g.workers = { animalkeeper: 1 };
  assert.equal(advance(g, 1).herd.goats, goats);
  assert.ok(validSave(JSON.parse(JSON.stringify(g))));
  assert.equal(restartGame(g).herd, undefined);
});

test('new and restarted games pause until the player assigns workers and resumes', async () => {
  const { restartGame } = await import('../lib/game.ts');
  const fresh = pausedInitialState();
  assert.equal(fresh.paused, true);
  const assigned = assign(fresh, 'gatherer', 2);
  assert.equal(assigned.workers.gatherer, 2);
  assert.deepEqual(advance(assigned, 600), assigned);
  const resumed = advance({ ...assigned, paused: false }, 1);
  assert.ok(resumed.stock.food > 0);
  assert.equal(restartGame(resumed).paused, true);
});


test('settlement needs respects discoveries, pause, capacity and equipment', async () => {
  const { settlementNeeds } = await import('../lib/game.ts');
  let g = pausedInitialState();
  const opening = settlementNeeds(g);
  assert.deepEqual(opening.map(n => n.node), ['population']);
  g = { ...g, paused: false, population: 10 };
  assert.ok(settlementNeeds(g).some(n => n.message.includes('capacity')));
  assert.ok(!settlementNeeds(g).some(n => n.node === 'shelterbuilder'));
  g.tech = ['sheltermaking', 'woodworking'];
  g.workers = { hunter: 2, shelterbuilder: 1 };
  const needs = settlementNeeds(g);
  assert.ok(needs.some(n => n.node === 'shelterbuilder'));
  assert.ok(needs.some(n => n.node === 'sticks'));
  g.stock.sticks = 2;
  assert.ok(!settlementNeeds(g).some(n => n.node === 'sticks'));
  g.settings = { showHuntingGuide: true, showSettlementNeeds: false };
  assert.equal(JSON.parse(JSON.stringify(g)).settings.showSettlementNeeds, false);
  assert.ok(validSave(g));
});


test('raw hides require preparation before construction and older saves remain readable', () => {
  let g = initialState();
  delete g.stock.preparedhides;
  assert.ok(validSave(g));
  g.produced.hides = 3;
  g.produced.tools = 1;
  g.workers.hunter = 1;
  g = advance(g, 1);
  assert.ok(g.tech.includes('hidepreparation'));
  g.tech.push('sheltermaking');
  g.stock.wood = 10;
  g.workers = { hunter: 1, shelterbuilder: 1 };
  assert.equal(advance(g, 1).shelterProgress || 0, 0);
  g = assign(g, 'hideworker', 1);
  const next = advance(g, 1);
  assert.ok(next.produced.preparedhides > 0);
  assert.ok(next.shelterProgress > 0);
  const paused = { ...next, paused: true };
  assert.deepEqual(advance(paused, 100), paused);
  assert.ok(validSave(next));
});


test('nets need actual fishing experience, accumulated per worker and preserved offline', () => {
  let g = initialState();
  g.tech = ['fishing','cordage'];
  g.produced.cord = 8;
  assert.ok(!advance(g, 500).tech.includes('netting'));
  g.workers = { fisher: 2 };
  g.settings = { showHuntingGuide: true, autoGrowth: false };
  g = advance(g, 59);
  assert.equal(g.activity.fisher, 118);
  assert.ok(!g.tech.includes('netting'));
  const next = advance(g, 1);
  assert.ok(next.tech.includes('netting'));
  assert.equal(next.activity.fisher, 120);
  const paused = { ...next, paused: true };
  assert.deepEqual(advance(paused, 100), paused);
  const loaded = JSON.parse(JSON.stringify(next));
  assert.ok(validSave(loaded));
  let live = next;
  for (let i = 0; i < 30; i++) live = advance(live, 1);
  assert.deepEqual(advance(loaded, 30), live);
});

test('craft practice excludes blocked work and old discoveries stay unlocked', () => {
  const g = initialState();
  g.tech = ['hidepreparation'];
  g.workers = { hunter: 0, hideworker: 1 };
  g.stock.hides = 20;
  assert.equal(advance(g, 10).activity?.hideworker || 0, 0);
  g.workers.gatherer = 2;
  g.stock.hides = 0;
  assert.equal(advance(g, 10).activity?.hideworker || 0, 0);
  g.stock.hides = 0.2;
  assert.equal(advance(g, 1).activity.hideworker, 0.5);
  g.tech.push('netting');
  delete g.activity;
  assert.ok(validSave(g));
  assert.ok(advance(g, 1).tech.includes('netting'));
});


test('hide preparation needs both lifetime hides and a produced basic tool', async () => {
  const { visibleConcepts } = await import('../lib/game.ts');
  for (const [hides, tools] of [[0, 0], [3, 0], [2.99, 1], [3, 0.99]]) {
    const g = initialState();
    g.produced.hides = hides; g.produced.tools = tools;
    const next = advance(g, 1);
    assert.ok(!next.tech.includes('hidepreparation'));
    assert.ok(!visibleConcepts(next).has('hideworker'));
  }
  const g = initialState();
  g.produced.hides = 3; g.produced.tools = 1;
  const next = advance(g, 1);
  assert.ok(next.tech.includes('hidepreparation'));
  assert.ok(visibleConcepts(next).has('hideworker'));
  assert.equal(next.stock.hides, 0);
  assert.equal(next.stock.tools, 0);
  g.tech = ['hidepreparation']; g.produced = {};
  assert.ok(advance(g, 1).tech.includes('hidepreparation'));
});


test('spear discovery improves the same wooden tools and hides obsolete nodes', async () => {
  const { equipmentUse, visibleConcepts } = await import('../lib/game.ts');
  const g = initialState();
  g.workers = { hunter: 1 };
  g.stock.sticks = 1;
  assert.equal(equipmentUse(g).bonuses.hunter, 0.25);
  g.tech = ['woodworking','spearmaking'];
  assert.equal(equipmentUse(g).bonuses.hunter, 0.5);
  assert.ok(!visibleConcepts(g).has('spears'));
  assert.ok(!visibleConcepts(g).has('gearmaker'));
  g.workers.gearmaker = 1;
  g.stock.spears = 3;
  g.paused = true;
  const migrated = advance(g, 1);
  assert.equal(migrated.stock.sticks, 4);
  assert.equal(migrated.stock.spears, 0);
  assert.equal(migrated.workers.woodworker, 1);
  assert.equal(migrated.workers.gearmaker, 0);
  assert.ok(validSave(migrated));
});


test('dwelling upgrades spend new materials, add capacity and fall back to basic shelters', async () => {
  const { housing } = await import('../lib/game.ts');
  const g = initialState();
  g.tech = ['sheltermaking','dwellings'];
  g.settings = { showHuntingGuide: true, autoGrowth: false };
  g.shelters = 1;
  g.workers = { hunter: 2, shelterbuilder: 1 };
  g.stock.wood = 100; g.stock.clay = 20; g.stock.fibres = 10;
  const upgraded = advance(g, 100);
  assert.equal(upgraded.upgradedShelters, 1);
  assert.equal(upgraded.shelters, 1);
  assert.equal(housing(upgraded), 14);
  assert.ok(upgraded.stock.clay < 1e-8);
  g.stock.clay = 0; g.stock.preparedhides = 10;
  const fallback = advance(g, 100);
  assert.equal(fallback.shelters, 2);
  assert.equal(fallback.upgradedShelters || 0, 0);
  assert.equal(housing(fallback), 14);
  assert.ok(validSave(upgraded));
});

test('successful care and actual herd growth unlock animal improvements', async () => {
  const { herdActivity } = await import('../lib/game.ts');
  const g = initialState();
  g.tech = ['animalkeeping'];
  g.settings = { showHuntingGuide: true, autoGrowth: false };
  g.workers = { hunter: 2, animalkeeper: 1 };
  g.stock.food = 100;
  g.herd = { goats: 4, establishment: 1, enclosures: 2, enclosureProgress: 0 };
  assert.equal(herdActivity(g).tended, 4);
  const next = advance(g, 600);
  assert.ok(next.tech.includes('herdmanagement'));
  assert.ok(next.tech.includes('breeding'));
  assert.equal(herdActivity(next).tended, 6);
  let live = g;
  for (let i = 0; i < 600; i++) live = advance(live, 1);
  assert.deepEqual(next, live);
  g.workers = {}; g.stock.food = 0;
  const stopped = advance(g, 600);
  assert.ok(!stopped.tech.includes('herdmanagement'));
  assert.equal(stopped.activity?.goatgrowth || 0, 0);
});

test('stone axes require practice and improve only equipped wood gatherers', async () => {
  const { woodGathering } = await import('../lib/game.ts');
  const g = initialState();
  g.produced.wood = 20; g.produced.tools = 3;
  assert.ok(!advance(g, 1).tech.includes('stoneaxes'));
  g.activity = { woodcutter: 120 };
  assert.ok(advance(g, 1).tech.includes('stoneaxes'));
  g.workers = { hunter: 2, woodcutter: 2 };
  g.stock.tools = 1;
  const baseline = advance(g, 1);
  g.tech = ['stoneaxes'];
  assert.equal(woodGathering(g).method, 'Mixed methods');
  assert.equal(woodGathering(g).multiplier, 1.5);
  const equipped = advance(g, 1);
  assert.ok(Math.abs(equipped.stock.wood - baseline.stock.wood * 1.5) < 1e-8);
  assert.equal(equipped.stock.tools, 0.925);
  g.stock.tools = 0;
  assert.equal(woodGathering(g).method, 'Collecting deadwood');
  assert.equal(advance(g, 1).stock.wood, 1);
  g.stock.tools = 2;
  assert.equal(woodGathering(g).method, 'Cutting with stone axes');
  g.workers.hunter = 0;
  assert.equal(advance(g, 1).stock.tools, 2);
});



test('legacy flint knappers and points merge into stone toolmaking once', async () => {
  const { visibleConcepts } = await import('../lib/game.ts');
  const g = initialState();
  g.paused = true;
  g.tech = ['woodworking','stonepoints'];
  g.workers = { pointmaker: 2, toolmaker: 1 };
  g.stock.points = 4;
  g.stock.tools = 2;
  g.produced.points = 7;
  g.produced.tools = 3;
  const next = advance(g, 1);
  assert.equal(next.workers.toolmaker, 3);
  assert.equal(next.workers.pointmaker, 0);
  assert.equal(next.stock.tools, 6);
  assert.equal(next.stock.points, 0);
  assert.equal(next.produced.tools, 10);
  assert.ok(!visibleConcepts(next).has('points'));
  assert.ok(!visibleConcepts(next).has('pointmaker'));
  assert.deepEqual(advance(next, 1), next);
  assert.ok(validSave(next));
});


test('general stone tool benefits consume tools only during productive work', async () => {
  const { ratePreview } = await import('../lib/game.ts');
  const g = initialState();
  g.stock.tools = 200;
  g.workers = { hunter: 1, toolmaker: 1 };
  const preview = ratePreview(g);
  assert.equal(preview.toolConsumption.hunter, 0.05);
  assert.equal(preview.toolConsumption.toolmaker || 0, 0);
  assert.equal(advance(g, 1).stock.tools, 199.95);
  g.paused = true;
  assert.deepEqual(ratePreview(g).toolConsumption, {});
  assert.equal(advance(g, 100).stock.tools, 200);
  g.paused = false; g.workers = {};
  assert.equal(advance(g, 100).stock.tools, 200);
});


test('tool production maintains a modest reserve and resumes after consumption', async () => {
  const { toolReserve, stoneEfficiency } = await import('../lib/game.ts');
  const g = initialState();
  g.tech = ['woodworking'];
  g.settings = { showHuntingGuide: true, autoGrowth: false };
  g.workers = { hunter: 2, woodworker: 1 };
  g.stock.wood = 400;
  const next = advance(g, 300);
  assert.ok(next.stock.sticks <= toolReserve(next, 'sticks') + 0.4);
  assert.ok(next.stock.sticks >= 2);
  const reserve = initialState();
  reserve.tech = ['woodworking'];
  reserve.workers = { woodworker: 1, hunter: 2 };
  reserve.stock.sticks = 5; reserve.stock.wood = 100;
  assert.equal(advance(reserve, 1).stock.wood, 100);
  reserve.stock.sticks = 0;
  assert.ok(advance(reserve, 1).stock.sticks > 0);
  reserve.stock.tools = 3;
  assert.equal(stoneEfficiency(reserve), 1);
});

