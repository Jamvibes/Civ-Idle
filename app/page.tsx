'use client';
import { useEffect, useState, useRef } from 'react';
import {
  Users,
  Sprout,
  Pickaxe,
  Hammer,
  FlaskConical,
  ArrowRight,
  Minus,
  Plus,
  Landmark,
  Network,
  BookOpen,
  CircleHelp,
  Settings,
  Pause,
  Play,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { createSaveStore } from '@/lib/save-store.mjs';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import DiscoveryCelebrations from '@/components/discovery-celebrations';
import ConceptMap from '@/components/concept-map';
import { Progress } from '@/components/ui/progress';
import {
  initialState,
  compendium,
  restartGame,
  jobs,
  technologies,
  resources,
  eras,
  advance,
  assign,
  visibleConcepts,
  ratePreview,
  workerCost,
  housing,
  capacity,
  unlocked,
  validSave,
  type Game,
} from '@/lib/game';
const fmt = (n: number) =>
  n >= 10000
    ? `${(n / 1000).toFixed(1)}k`
    : n.toLocaleString('en', { maximumFractionDigits: 1 });
const recipe = (r: Record<string, number>) =>
  Object.entries(r)
    .map(([k, v]) => `${fmt(v)} ${resources[k]?.name || k}`)
    .join(' + ');
export default function Home() {
  const [game, setGame] = useState<Game>(initialState);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState(
    'Assign your people to begin. Gather food and explore the world around your village.',
  );
  const [help, setHelp] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [restartError, setRestartError] = useState('');
  const [mapSession, setMapSession] = useState(0);
  const showHuntingGuide = game.settings?.showHuntingGuide ?? true;
  const setHuntingGuide = (show: boolean) =>
    setGame((g) => ({
      ...g,
      settings: { ...g.settings, showHuntingGuide: show },
    }));
  const [saveLabel, setSaveLabel] = useState('Loading settlement');
  const [saveBlocked, setSaveBlocked] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const store = createSaveStore(window);
    (async () => {
      try {
        const raw = await store.load();
        if (cancelled) return;
        if (raw) {
          const g = JSON.parse(raw);
          if (!validSave(g)) throw new Error('Unsupported or damaged save');
          const elapsed = Math.min(
            28800,
            Math.max(0, (Date.now() - g.savedAt) / 1000),
          );
          setGame(advance(g, elapsed));
          if (elapsed > 60)
            setNotice(
              g.paused
                ? 'Welcome back. Time remained paused.'
                : 'Welcome back. Your village continued working while you were away.',
            );
        }
        setSaveLabel(store.label);
        setReady(true);
      } catch {
        if (!cancelled) {
          setSaveBlocked(true);
          setSaveLabel('Save needs attention');
          setNotice(
            'Your existing save could not be loaded. It has been preserved; reload after resolving the save issue.',
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    let last = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      setGame((g) => advance(g, Math.min(28800, (now - last) / 1000)));
      last = now;
    }, 1000);
    return () => clearInterval(timer);
  }, [ready]);
  useEffect(() => {
    if (!ready || saveBlocked) return;
    let cancelled = false;
    const store = createSaveStore(window);
    store
      .save({ ...game, savedAt: Date.now() })
      .then(() => {
        if (!cancelled) setSaveLabel(store.label);
      })
      .catch(() => {
        if (!cancelled) {
          setSaveLabel('Saving unavailable');
          setNotice(
            'Progress could not be saved. Keep the game open while resolving the storage issue.',
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [game, ready, saveBlocked]);
  const previousDiscoveries = useRef<string[] | null>(null);
  useEffect(() => {
    if (!ready) return;
    const previous = previousDiscoveries.current;
    if (previous) {
      const added = game.tech.filter((id) => !previous.includes(id));
      if (added.length)
        setNotice(
          'Your people discovered ' +
            added
              .map((id) => technologies.find((t) => t.id === id)?.name)
              .join(', ') +
            '. New possibilities have opened up.',
        );
    }
    previousDiscoveries.current = game.tech;
  }, [game.tech, ready]);
  const previousFinds = useRef<string[] | null>(null);
  useEffect(() => {
    if (!ready) return;
    const found = game.discoveries || [];
    if (previousFinds.current) {
      const added = found.filter((id) => !previousFinds.current!.includes(id));
      if (added.length)
        setNotice(
          'Discovered ' +
            added
              .map((id) => compendium.find((e) => e.id === id)?.name)
              .join(', ') +
            '. View your compendium.',
        );
    }
    previousFinds.current = found;
  }, [game.discoveries, ready]);
  const gameRef = useRef(game);
  gameRef.current = game;
  useEffect(() => {
    const context = (
      document as unknown as {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options: unknown,
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: 'read_settlement',
            description:
              'Read current village resources, worker assignments and discoveries.',
            inputSchema: {
              type: 'object',
              properties: {},
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true },
            execute: (input: unknown) => {
              if (
                !input ||
                typeof input !== 'object' ||
                Object.keys(input).length
              )
                throw new Error('Expected an empty object');
              return structuredClone(gameRef.current);
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  }, []);
  const idle =
    game.population - Object.values(game.workers).reduce((a, b) => a + b, 0);
  const { rates, blocked } = ratePreview(game);
  const era = Math.max(
    0,
    ...technologies.filter((t) => game.tech.includes(t.id)).map((t) => t.era),
  );
  const act = (fn: (g: Game) => Game, msg?: string) => {
    setGame(fn);
    if (msg) setNotice(msg);
  };
  const confirmRestart = async () => {
    if (restarting) return;
    setRestarting(true);
    setRestartError('');
    setReady(false);
    const fresh = restartGame(game);
    try {
      await createSaveStore(window).save(fresh);
      previousDiscoveries.current = [];
      setGame(fresh);
      setMapSession((n) => n + 1);
      setHelp(false);
      setNotice(
        'A new beginning. Assign your five settlers to grow your village.',
      );
      setRestartOpen(false);
      setSettingsOpen(false);
    } catch {
      setRestartError(
        'Could not save the restart. Your current village is still active. Please try again.',
      );
    } finally {
      setReady(true);
      setRestarting(false);
    }
  };
  return (
    <div className="game-shell network-layout">
      <DiscoveryCelebrations key={mapSession} game={game} ready={ready} />
      <header className="topbar">
        <a href="./" className="brand">
          <Landmark size={28} />
          <span>
            CIV<span className="brand-light">IDLE</span>
          </span>
          <small>A CIVILIZATION IN THE MAKING</small>
        </a>
        <div className="top-actions">
          <button
            className="icon-button"
            aria-label="Settings"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings size={19} />
          </button>
          <span className="save-dot" />
          {saveLabel}
          <button
            className="icon-button"
            aria-label={game.paused ? 'Resume game' : 'Pause game'}
            onClick={() => act((g) => ({ ...g, paused: !g.paused }))}
          >
            {game.paused ? <Play size={18} /> : <Pause size={18} />}
          </button>
          <button
            className="icon-button"
            aria-label="How to play"
            onClick={() => setHelp(!help)}
          >
            <CircleHelp size={19} />
          </button>
        </div>
      </header>
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="game-settings">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Choose which guidance appears while you play.
          </DialogDescription>
          <div className="guide-setting">
            <div>
              <label htmlFor="hunting-guide">Explore hunting guide</label>
              <p>Show the introductory guide when no map node is selected.</p>
            </div>
            <Switch
              id="hunting-guide"
              checked={showHuntingGuide}
              disabled={!ready}
              onCheckedChange={setHuntingGuide}
            />
          </div>
          <div className="guide-setting">
            <div>
              <label htmlFor="auto-growth">Automatic population growth</label>
              <p>
                Spend the food threshold to welcome a new person. Excess food is
                kept.
              </p>
            </div>
            <Switch
              id="auto-growth"
              checked={game.settings?.autoGrowth !== false}
              disabled={!ready}
              onCheckedChange={(enabled) =>
                setGame((g) => ({
                  ...g,
                  settings: {
                    showHuntingGuide: g.settings?.showHuntingGuide ?? true,
                    ...g.settings,
                    autoGrowth: enabled,
                  },
                }))
              }
            />
          </div>
          <div className="restart-setting">
            <div className="guide-setting">
              <div>
                <label htmlFor="settlement-needs">Settlement needs</label>
                <p>
                  Show useful prompts for workers, capacity, supplies and
                  equipment.
                </p>
              </div>
              <Switch
                id="settlement-needs"
                disabled={!ready}
                checked={game.settings?.showSettlementNeeds !== false}
                onCheckedChange={(show) =>
                  setGame((g) => ({
                    ...g,
                    settings: {
                      showHuntingGuide: g.settings?.showHuntingGuide ?? true,
                      ...g.settings,
                      showSettlementNeeds: show,
                    },
                  }))
                }
              />
            </div>
            <h3>Start over</h3>
            <p>Begin again with five settlers and an undiscovered world.</p>
            <button
              className="restart-button"
              disabled={!ready}
              onClick={() => {
                setRestartError('');
                setRestartOpen(true);
              }}
            >
              Restart game
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={restartOpen}
        onOpenChange={(open) => {
          if (!restarting) setRestartOpen(open);
        }}
      >
        <AlertDialogContent className="game-settings">
          <AlertDialogTitle>Restart your village?</AlertDialogTitle>
          <AlertDialogDescription>
            This replaces your saved village and resets all resources, workers,
            buildings, discoveries and progress. Your guide preference stays
            unchanged. This cannot be undone.
          </AlertDialogDescription>
          {restartError && <p role="alert">{restartError}</p>}
          <div className="restart-actions">
            <AlertDialogCancel disabled={restarting}>
              Keep playing
            </AlertDialogCancel>
            <button
              className="restart-button"
              disabled={restarting}
              onClick={confirmRestart}
            >
              {restarting ? 'Restarting…' : 'Restart from the beginning'}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      <div className="era-strip">
        {eras.map((e, i) => (
          <div
            key={e}
            className={i === era ? 'era current' : i < era ? 'era past' : 'era'}
          >
            <span>{String(i + 1).padStart(2, '0')}</span>
            {e}
            {i < eras.length - 1 && <ArrowRight size={13} />}
          </div>
        ))}
      </div>
      <main className="layout">
        <aside className="stockpile">
          <div className="section-label">
            THE STOCKPILE <span>PER SECOND</span>
          </div>
          {Object.entries(resources)
            .filter(([k]) => visibleConcepts(game).has(k))
            .map(([k, r]) => (
              <div className="resource" key={k}>
                <span className="resource-symbol" style={{ color: r.color }}>
                  {r.symbol}
                </span>
                <div>
                  <strong>{r.name}</strong>
                  <small>
                    {fmt(game.stock[k] || 0)}{' '}
                    <span>/ {fmt(capacity(game, k))}</span>
                  </small>
                </div>
                <span
                  className={`rate ${(rates[k] || 0) < 0 ? 'negative' : ''}`}
                >
                  {rates[k] > 0 ? '+' : ''}
                  {fmt(rates[k] || 0)}
                </span>
              </div>
            ))}
          <div className="stock-note">
            Resources flow between jobs. Keep raw materials coming to feed your
            workshops.
          </div>
          <div className="section-label">SETTLEMENT RECORD</div>
          <p className="record">
            {Math.floor(game.time / 60)} minutes of history
            <br />
            {game.tech.length} discoveries made
          </p>
        </aside>
        <section className="workspace">
          <div className="heading">
            <div>
              <div className="eyebrow">
                {eras[era]} · CHAPTER {String(era + 1).padStart(2, '0')}
              </div>
              <h1>
                {game.tech.includes('community')
                  ? 'A village takes root.'
                  : 'A small beginning.'}
              </h1>
              <p>{'A handful of people. A world of possibilities.'}</p>
            </div>
            <span className="era-seal">
              <Landmark size={31} />
            </span>
          </div>
          <div className="population-panel">
            <div>
              <span className="section-label">YOUR PEOPLE</span>
              <div className="population-number">
                <Users size={25} />
                <strong>{game.population}</strong>
                <span>/ {housing(game)} capacity</span>
              </div>
            </div>
            <div className="work-count">
              <strong>{game.population - idle}</strong>
              <span>assigned</span>
            </div>
            <div className="work-count idle">
              <strong>{idle}</strong>
              <span>unassigned</span>
            </div>
            <div className="work-count">
              <strong>
                {game.population >= housing(game)
                  ? 'At capacity'
                  : `${fmt(game.stock.food)} / ${workerCost(game)} food`}
              </strong>
              <span>
                {game.settings?.autoGrowth === false
                  ? 'growth paused'
                  : 'next person · automatic'}
              </span>
            </div>
          </div>
          <div className="notice" role="status">
            <span>✦</span>
            {game.paused
              ? 'Time is paused. Assign people to Hunter or Gatherer, then press the play button above to begin.'
              : notice}
          </div>
          {help && (
            <div className="help">
              <strong>Build a civilization, one connection at a time.</strong>
              <p>
                Assign gatherers and hunters for food. Each food threshold
                automatically adds an unassigned settler and keeps any excess
                food. Every person eats 0.15 food/s. Add woodcutters, stone
                collectors and tool makers to develop your village. Discoveries
                emerge automatically from lifetime production, without spending
                resources. Jobs continuously consume their listed inputs. Empty
                inputs slow that job. An empty food stockpile has no penalty.
                Non-food jobs wait until food production exceeds village upkeep
                and assigned job inputs. Food producers always work. Tools help
                your people work more effectively. Saves and up to 8 hours of
                offline progress stay in this browser.
              </p>
              <button onClick={() => setHelp(false)}>Got it</button>
            </div>
          )}
          <Tabs defaultValue="workers">
            <TabsList variant="line" className="main-tabs">
              <TabsTrigger value="workers">
                <Network /> Settlement map
              </TabsTrigger>
              <TabsTrigger value="research">
                <FlaskConical /> Discoveries{' '}
                <span className="tab-count">{game.tech.length}</span>
              </TabsTrigger>
              <TabsTrigger value="compendium">
                <BookOpen /> Compendium
              </TabsTrigger>
            </TabsList>
            <TabsContent value="workers">
              <ConceptMap
                key={mapSession}
                game={game}
                ready={ready}
                blocked={blocked}
                onChange={setGame}
                showHuntingGuide={ready && showHuntingGuide}
                onDismissGuide={() => setHuntingGuide(false)}
              />
            </TabsContent>
            <TabsContent value="compendium">
              <div className="list-heading">
                <h2>Your compendium</h2>
                <span>Discoveries from exploration</span>
              </div>
              {!game.discoveries?.length && (
                <p className="help">
                  Your compendium is empty. Gatherers explore plant life, and
                  hunters explore the surrounding landscape.
                </p>
              )}
              {['Plants', 'Water sources'].map((category) => {
                const entries = compendium.filter(
                  (e) =>
                    e.category === category && game.discoveries?.includes(e.id),
                );
                if (!entries.length) return null;
                return (
                  <section key={category}>
                    <h2>{category}</h2>
                    {[...new Set(entries.map((e) => e.group))].map((group) => (
                      <div key={group}>
                        <h3>{group}</h3>
                        <div className="research-grid">
                          {entries
                            .filter((e) => e.group === group)
                            .map((e) => (
                              <article
                                className="tech-card complete"
                                key={e.id}
                              >
                                <h3>{e.name}</h3>
                                <p>{e.description}</p>
                                <small>
                                  Discovered by{' '}
                                  {e.job === 'hunter' ? 'hunters' : 'gatherers'}
                                </small>
                              </article>
                            ))}
                        </div>
                      </div>
                    ))}
                  </section>
                );
              })}
            </TabsContent>
            <TabsContent value="research">
              <div className="list-heading">
                <h2>Ideas that change everything</h2>
                <span>Discoveries are permanent</span>
              </div>
              {game.tech.length === 0 && (
                <p className="help">
                  Your village has not made any discoveries yet. Keep your
                  people working and new ideas will emerge naturally.
                </p>
              )}
              <div className="research-grid">
                {technologies
                  .filter((t) => game.tech.includes(t.id))
                  .map((t) => {
                    const done = game.tech.includes(t.id),
                      available = t.requires.every((r) =>
                        game.tech.includes(r),
                      );
                    return (
                      <article
                        className={`tech-card ${done ? 'complete' : ''}`}
                        key={t.id}
                      >
                        <span className="eyebrow">{eras[t.era]}</span>
                        <h3>
                          {t.name}
                          {done && ' ✓'}
                        </h3>
                        <p>{t.description}</p>
                        <small>
                          {!available
                            ? `Requires ${t.requires.map((id) => technologies.find((x) => x.id === id)?.name).join(', ')}`
                            : t.id === 'agriculture'
                              ? 'Discovered through wild grain and fresh water'
                              : `Produced over time: ${recipe(t.milestones)}`}
                        </small>
                        <span className="discovery-status">
                          {done
                            ? 'Discovered through village life'
                            : available
                              ? 'Emerging through everyday work'
                              : 'Earlier discoveries needed'}
                        </span>
                      </article>
                    );
                  })}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
      <footer>
        CIV IDLE <span>The first chapter of civilization.</span>
        <span>Prototype 0.1 · Local autosave · 8h offline progress</span>
      </footer>
    </div>
  );
}
