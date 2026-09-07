import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createSaveStore, SAVE_KEY } from '../lib/save-store.mjs';
import { createDiskStore } from '../desktop/save-store.mjs';
import { initialState, validSave } from '../lib/game.ts';
test('browser adapter preserves the existing save key and format', async () => {
  const data = new Map();
  const store = createSaveStore({
    localStorage: {
      getItem: (k) => data.get(k) || null,
      setItem: (k, v) => data.set(k, v),
    },
  });
  assert.equal(await store.load(), null);
  const g = initialState();
  await store.save(g);
  assert.deepEqual(JSON.parse(data.get(SAVE_KEY)), g);
  assert.ok(validSave(JSON.parse(await store.load())));
});
test('desktop adapter uses only the narrow save bridge', async () => {
  let raw = null;
  const store = createSaveStore({
    civDesktop: {
      loadSave: async () => raw,
      saveGame: async (value) => {
        raw = value;
      },
    },
  });
  const g = initialState();
  await store.save(g);
  assert.deepEqual(JSON.parse(await store.load()), g);
});
test('disk saves serialize, reject invalid payloads, and survive reopening', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'civ-save-test-'));
  try {
    const store = createDiskStore(dir, validSave);
    assert.equal(await store.load(), null);
    const first = initialState(),
      last = { ...first, time: 10 };
    await Promise.all([
      store.save(JSON.stringify(first)),
      store.save(JSON.stringify(last)),
    ]);
    await store.flush();
    assert.deepEqual(
      JSON.parse(await createDiskStore(dir, validSave).load()),
      last,
    );
    await assert.rejects(store.save('{broken'));
    await assert.rejects(store.save(JSON.stringify({ version: 999 })));
    assert.deepEqual(JSON.parse(await store.load()), last);
    await writeFile(path.join(dir, 'settlement.json.tmp'), 'interrupted');
    assert.deepEqual(JSON.parse(await store.load()), last);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('guide preference survives save reload and older saves remain valid',async()=>{const data=new Map();const store=createSaveStore({localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}});const old=initialState();assert.ok(validSave(old));assert.equal(old.settings?.showHuntingGuide??true,true);for(const showHuntingGuide of [false,true]){const g={...old,settings:{showHuntingGuide}};await store.save(g);const loaded=JSON.parse(await store.load());assert.ok(validSave(loaded));assert.equal(loaded.settings.showHuntingGuide,showHuntingGuide);}assert.equal(validSave({...old,settings:{showHuntingGuide:'yes'}}),false);});
