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
  Pause,
  Play,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  initialState,
  jobs,
  technologies,
  resources,
  eras,
  advance,
  assign,
  recruit,
  research,
  build,
  ratePreview,
  workerCost,
  buildingCost,
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
    'Assign your people to begin. Food brings new settlers; knowledge opens new possibilities.',
  );
  const [help, setHelp] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('civ-idle-v1');
      if (raw) {
        const g = JSON.parse(raw);
        if (validSave(g)) {
          const elapsed = Math.min(
            28800,
            Math.max(0, (Date.now() - g.savedAt) / 1000),
          );
          setGame(advance(g, elapsed));
          if (elapsed > 60)
            setNotice(
              `Welcome back. ${g.paused ? 'Time remained paused.' : `Your settlement worked for ${Math.floor(elapsed / 60)} minutes (up to 8 hours).`}`,
            );
        }
      }
    } catch {
      setNotice('Your save could not be loaded. A fresh settlement is ready.');
    }
    setReady(true);
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
    if (!ready) return;
    try {
      localStorage.setItem(
        'civ-idle-v1',
        JSON.stringify({ ...game, savedAt: Date.now() }),
      );
    } catch {
      setNotice(
        'Saving is unavailable in this browser. Keep this tab open to retain progress.',
      );
    }
  }, [game, ready]);
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
  const current = technologies.find(
    (t) =>
      !game.tech.includes(t.id) &&
      t.requires.every((r) => game.tech.includes(r)),
  );
  const era = Math.max(
    0,
    ...technologies.filter((t) => game.tech.includes(t.id)).map((t) => t.era),
  );
  const act = (fn: (g: Game) => Game, msg?: string) => {
    setGame(fn);
    if (msg) setNotice(msg);
  };
  return (
    <div className="game-shell">
      <header className="topbar">
        <a href="./" className="brand">
          <Landmark size={28} />
          <span>
            CIV<span className="brand-light">IDLE</span>
          </span>
          <small>A CIVILIZATION IN THE MAKING</small>
        </a>
        <div className="top-actions">
          <span className="save-dot" />
          {ready ? 'Saved on this device' : 'Loading settlement'}
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
            .filter(([k, r]) => r.era <= era || game.stock[k] > 0)
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
              <span>working</span>
            </div>
            <div className="work-count idle">
              <strong>{idle}</strong>
              <span>unassigned</span>
            </div>
            <button
              className="primary"
              disabled={
                !ready ||
                game.stock.food < workerCost(game) ||
                game.population >= housing(game)
              }
              onClick={() =>
                act(
                  recruit,
                  'A new settler has arrived. Assign them a job below.',
                )
              }
            >
              <Plus size={17} /> Recruit a settler
              <small>{workerCost(game)} food</small>
            </button>
          </div>
          <div className="notice" role="status">
            <span>✦</span>
            {game.paused
              ? 'Time is paused. Resume using the play button above.'
              : notice}
          </div>
          {help && (
            <div className="help">
              <strong>Build a civilization, one connection at a time.</strong>
              <p>
                Assign gatherers and hunters for food, then recruit settlers.
                Every person eats 0.15 food/s. Add woodcutters, stone
                collectors, tool makers and thinkers to unlock agriculture.
                Build homes to grow. Research spends resources once; jobs
                continuously consume their listed inputs. Empty inputs slow that
                job. Food shortages reduce non-food work to 25%; nobody dies.
                Tools and clothing boost production; pottery increases storage.
                Saves and up to 8 hours of offline progress stay in this
                browser.
              </p>
              <button onClick={() => setHelp(false)}>Got it</button>
            </div>
          )}
          <Tabs defaultValue="workers">
            <TabsList variant="line" className="main-tabs">
              <TabsTrigger value="workers">
                <Users /> Workforce
              </TabsTrigger>
              <TabsTrigger value="research">
                <FlaskConical /> Research{' '}
                <span className="tab-count">
                  {game.tech.length}/{technologies.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="network">
                <Network /> Supply network
              </TabsTrigger>
            </TabsList>
            <TabsContent value="workers">
              <div className="list-heading">
                <h2>Give everyone a purpose</h2>
                <span>Move workers freely with − and +</span>
              </div>
              <div className="job-list">
                {jobs
                  .filter((j) => unlocked(game, j.tech))
                  .map((j) => (
                    <div className="job-row" key={j.id}>
                      <div className={`job-icon ${j.group}`}>
                        {j.group === 'food' ? (
                          <Sprout />
                        ) : j.group === 'gather' ? (
                          <Pickaxe />
                        ) : j.group === 'knowledge' ? (
                          <BookOpen />
                        ) : (
                          <Hammer />
                        )}
                      </div>
                      <div className="job-description">
                        <h3>
                          {j.name}
                          {(game.workers[j.id] || 0) > 0 && (
                            <span
                              className={
                                blocked.includes(j.id)
                                  ? 'job-state blocked'
                                  : 'job-state'
                              }
                            >
                              {blocked.includes(j.id)
                                ? 'INPUT SHORTAGE'
                                : 'WORKING'}
                            </span>
                          )}
                        </h3>
                        <p>{j.description}</p>
                        <small>
                          {Object.keys(j.input).length > 0 && (
                            <>
                              <span className="input-recipe">
                                {recipe(j.input)}
                              </span>{' '}
                              →{' '}
                            </>
                          )}
                          <span className="output-recipe">
                            {recipe(j.output)}/s
                          </span>
                          <span className="per-worker">
                            {' '}
                            · per worker, before bonuses
                          </span>
                        </small>
                      </div>
                      <div className="stepper">
                        <button
                          disabled={!game.workers[j.id]}
                          aria-label={`Remove ${j.name}`}
                          onClick={() => act((g) => assign(g, j.id, -1))}
                        >
                          <Minus size={16} />
                        </button>
                        <span>{game.workers[j.id] || 0}</span>
                        <button
                          disabled={!ready || idle === 0}
                          aria-label={`Assign ${j.name}`}
                          onClick={() => act((g) => assign(g, j.id, 1))}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="next-unlock">
                <FlaskConical size={18} /> New jobs appear as you discover
                technologies.
              </div>
            </TabsContent>
            <TabsContent value="research">
              <div className="list-heading">
                <h2>Ideas that change everything</h2>
                <span>Discoveries are permanent</span>
              </div>
              <div className="research-grid">
                {technologies.map((t) => {
                  const done = game.tech.includes(t.id),
                    available = t.requires.every((r) => game.tech.includes(r));
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
                          : recipe(t.cost)}
                      </small>
                      <button
                        disabled={
                          done ||
                          !available ||
                          !Object.entries(t.cost).every(
                            ([k, v]) => game.stock[k] >= v,
                          )
                        }
                        onClick={() =>
                          act(
                            (g) => research(g, t.id),
                            `${t.name} discovered. New possibilities await in your workforce.`,
                          )
                        }
                      >
                        {done
                          ? 'Discovered'
                          : !available
                            ? 'Locked'
                            : 'Research'}
                        {!done && <ArrowRight size={16} />}
                      </button>
                    </article>
                  );
                })}
              </div>
            </TabsContent>
            <TabsContent value="network">
              <div className="list-heading">
                <h2>Everything is connected</h2>
                <span>From raw materials to village life</span>
              </div>
              <p className="network-intro">
                Follow the connections from the forest and riverbank to your
                first village.
              </p>
              {jobs
                .filter((j) => Object.keys(j.input).length > 0)
                .map((j) => (
                  <div
                    className={`chain ${unlocked(game, j.tech) ? '' : 'locked-chain'}`}
                    key={j.id}
                  >
                    <div>
                      {Object.keys(j.input).map((k) => (
                        <span className="node" key={k}>
                          {resources[k].symbol} {resources[k].name}
                        </span>
                      ))}
                    </div>
                    <ArrowRight />
                    <div className="chain-job">
                      {j.name}
                      <small>
                        {unlocked(game, j.tech)
                          ? 'Available'
                          : `Requires ${technologies.find((t) => t.id === j.tech)?.name}`}
                      </small>
                    </div>
                    <ArrowRight />
                    <div>
                      {Object.keys(j.output).map((k) => (
                        <span className="node result" key={k}>
                          {resources[k].symbol} {resources[k].name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              <div className="help">
                <strong>The compounding effect</strong>
                <p>
                  Tools improve all production by up to 100%. Clothing adds up
                  to 25%. Controlled fire increases food production by 20%. Each
                  stored pottery vessel adds 2 capacity to every resource.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </section>
        <aside className="right-rail">
          <div className="section-label">ON THE HORIZON</div>
          {current ? (
            <article className="milestone">
              <div className="eyebrow">NEXT DISCOVERY</div>
              <FlaskConical className="milestone-icon" size={34} />
              <h2>{current.name}</h2>
              <p>{current.description}</p>
              {Object.entries(current.cost).map(([k, v]) => (
                <div className="goal-resource" key={k}>
                  <div>
                    <span>{resources[k].name}</span>
                    <span>
                      {fmt(Math.min(game.stock[k] || 0, v))} / {v}
                    </span>
                  </div>
                  <Progress
                    aria-label={`${resources[k].name} for ${current.name}`}
                    value={Math.min(100, ((game.stock[k] || 0) / v) * 100)}
                  />
                </div>
              ))}
              <button
                className="primary"
                disabled={
                  !Object.entries(current.cost).every(
                    ([k, v]) => game.stock[k] >= v,
                  )
                }
                onClick={() =>
                  act(
                    (g) => research(g, current.id),
                    `${current.name} discovered!`,
                  )
                }
              >
                Discover {current.name}
                <ArrowRight size={16} />
              </button>
            </article>
          ) : (
            <article className="milestone">
              <h2>A village takes root</h2>
              <p>
                You have discovered every technology in this first chapter. Keep
                growing your village and balancing its resources.
              </p>
            </article>
          )}
          <div className="section-label infrastructure-label">
            GROW YOUR SETTLEMENT
          </div>
          {(['home', 'warehouse'] as const).map((k) => (
            <article className="building" key={k}>
              <div>
                <h3>{k === 'home' ? 'Build a home' : 'Expand storage'}</h3>
                <span>LEVEL {game.buildings[k]}</span>
              </div>
              <p>
                {k === 'home'
                  ? '+5 population capacity'
                  : '+500 capacity for every resource'}
              </p>
              <small>{recipe(buildingCost(game, k))}</small>
              <button
                disabled={
                  !Object.entries(buildingCost(game, k)).every(
                    ([r, v]) => game.stock[r] >= v,
                  )
                }
                onClick={() => act((g) => build(g, k))}
              >
                Build <Plus size={16} />
              </button>
            </article>
          ))}
          <div className="field-notes">
            <span className="eyebrow">FIELD NOTES</span>
            <p>“A sharpened stone. A planted seed. A place to call home.”</p>
            <span>Great beginnings are built together.</span>
          </div>
        </aside>
      </main>
      <footer>
        CIV IDLE <span>The first chapter of civilization.</span>
        <span>Prototype 0.1 · Local autosave · 8h offline progress</span>
      </footer>
    </div>
  );
}
