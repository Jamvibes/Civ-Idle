import { test } from 'node:test';
import assert from 'node:assert/strict';
import { separateNodes } from '../lib/node-layout.ts';

test('node collisions separate overlaps while holding the dragged node in place', () => {
  const nodes = [{ id: 'a', x: 300, y: 300 }, { id: 'b', x: 300, y: 300 }, { id: 'c', x: 420, y: 300 }];
  const result = separateNodes(nodes, 'a');
  assert.deepEqual(result[0], nodes[0]);
  for (let i = 0; i < result.length; i++) for (let j = i + 1; j < result.length; j++)
    assert.ok(Math.hypot(result[i].x - result[j].x, result[i].y - result[j].y) >= 147.9);
  assert.equal(nodes[1].x, 300);
  assert.deepEqual(separateNodes(result, 'a'), result);
});

test('collision layouts remain finite and within the map near its edges', () => {
  const result = separateNodes([{ id: 'a', x: 70, y: 70 }, { id: 'b', x: 70, y: 70 }], 'a');
  for (const p of result) {
    assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
    assert.ok(p.x >= 70 && p.x <= 1730 && p.y >= 70 && p.y <= 1430);
  }
  assert.ok(Math.hypot(result[0].x - result[1].x, result[0].y - result[1].y) >= 147.9);
});
