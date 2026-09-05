import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  initialState,
  assign,
  recruit,
  research,
  advance,
  build,
  capacity,
  validSave,
  jobs,
  technologies,
} from '../lib/game.ts';
test('assignments preserve population and prevent locked or negative jobs', () => {
  let g = initialState();
  g = assign(g, 'thinker', 3);
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
  g.workers = { toolmaker: 5 };
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
    thinker: 1,
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
test('research prerequisites and payment are enforced', () => {
  const g = initialState();
  g.stock.knowledge = 500;
  g.stock.wood = 500;
  g.stock.stone = 500;
  g.stock.tools = 500;
  assert.equal(research(g, 'agriculture'), g);
  const n = research(g, 'fire');
  assert.equal(n.stock.knowledge, 480);
  assert.equal(research(n, 'fire'), n);
  assert.ok(research(n, 'agriculture').tech.includes('agriculture'));
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
  g.population = 10;
  g.workers = {
    hunter: 2,
    gatherer: 1,
    woodcutter: 2,
    knapper: 2,
    toolmaker: 1,
    thinker: 2,
  };
  g = advance(g, 300);
  g = research(g, 'fire');
  assert.ok(g.tech.includes('fire'));
  g = advance(g, 300);
  g = research(g, 'agriculture');
  g = research(g, 'pottery');
  g = research(g, 'clothing');
  assert.equal(g.tech.length, 4);
  g.workers = {
    farmer: 2,
    woodcutter: 1,
    knapper: 1,
    toolmaker: 1,
    thinker: 1,
    hunter: 1,
    claydigger: 1,
    potter: 1,
    tanner: 1,
  };
  g = advance(g, 600);
  g = research(g, 'community');
  assert.equal(g.tech.length, technologies.length);
  assert.ok(validSave(g));
});
