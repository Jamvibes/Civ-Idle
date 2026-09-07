'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { separateNodes } from '@/lib/node-layout';
import { Input } from '@/components/ui/input';
import {
  Users,
  Sprout,
  Hammer,
  Pickaxe,
  Hand,
  BookOpen,
  LockKeyhole,
  ArrowRight,
  X,
  Focus,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  jobs,
  resources,
  technologies,
  unlocked,
  visibleConcepts,
  waitingForFood,
  assign,
  capacity,
  workerCost,
  heatSupply,
  stickBonus,
  equipmentUse,
  stoneEfficiency,
  toolReserve,
  ratePreview,
  woodGathering,
  housing,
  jobInputs,
  upgradingShelter,
  settlementNeeds,
  herdActivity,
  type Game,
} from '@/lib/game';

type Concept = { id: string; x: number; y: number };
const defaultPositions: Concept[] = [
  { id: 'hideworker', x: 570, y: 1370 },
  { id: 'preparedhides', x: 790, y: 1370 },
  { id: 'animalkeeper', x: 100, y: 1170 },
  { id: 'goats', x: 330, y: 1170 },
  { id: 'enclosurebuilder', x: 540, y: 1170 },
  { id: 'enclosures', x: 760, y: 1170 },
  { id: 'fibrecollector', x: 1220, y: 130 },
  { id: 'fibres', x: 1450, y: 130 },
  { id: 'cordmaker', x: 1650, y: 300 },
  { id: 'cord', x: 1450, y: 470 },
  { id: 'pointmaker', x: 1200, y: 700 },
  { id: 'points', x: 1430, y: 700 },
  { id: 'gearmaker', x: 1650, y: 870 },
  { id: 'spears', x: 1430, y: 1070 },
  { id: 'basketmaker', x: 1220, y: 1270 },
  { id: 'baskets', x: 1000, y: 1270 },
  { id: 'netmaker', x: 1650, y: 1270 },
  { id: 'nets', x: 1440, y: 1410 },
  { id: 'shelterbuilder', x: 550, y: 930 },
  { id: 'shelters', x: 950, y: 980 },
  { id: 'woodworker', x: 350, y: 970 },
  { id: 'sticks', x: 100, y: 950 },
  { id: 'fisher', x: 1010, y: 490 },
  { id: 'hearthkeeper', x: 550, y: 340 },
  { id: 'heat', x: 780, y: 340 },
  { id: 'cooking', x: 1000, y: 340 },
  { id: 'gatherer', x: 120, y: 120 },
  { id: 'hunter', x: 330, y: 100 },
  { id: 'food', x: 160, y: 300 },
  { id: 'hides', x: 545, y: 105 },
  { id: 'tanner', x: 750, y: 110 },
  { id: 'clothing', x: 965, y: 150 },
  { id: 'farmer', x: 90, y: 490 },
  { id: 'population', x: 385, y: 315 },
  { id: 'elder', x: 595, y: 300 },
  { id: 'knowledge', x: 820, y: 330 },
  { id: 'thinker', x: 1010, y: 380 },
  { id: 'woodcutter', x: 115, y: 700 },
  { id: 'wood', x: 340, y: 580 },
  { id: 'knapper', x: 355, y: 815 },
  { id: 'stone', x: 560, y: 760 },
  { id: 'toolmaker', x: 580, y: 530 },
  { id: 'tools', x: 790, y: 550 },
  { id: 'claydigger', x: 980, y: 830 },
  { id: 'clay', x: 990, y: 625 },
  { id: 'potter', x: 790, y: 775 },
  { id: 'pottery', x: 720, y: 975 },
];
const number = (v: number) =>
  v.toLocaleString('en', { maximumFractionDigits: 2 });
export default function ConceptMap({
  game,
  ready,
  blocked,
  onChange,
  showHuntingGuide,
  onDismissGuide,
}: {
  showHuntingGuide: boolean;
  onDismissGuide: () => void;
  game: Game;
  ready: boolean;
  blocked: string[];
  onChange: (fn: (g: Game) => Game) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const needs = ready ? settlementNeeds(game) : [];
  const showNeeds = game.settings?.showSettlementNeeds !== false;
  const showSidebar = selected !== null || showHuntingGuide;
  const [zoom, setZoom] = useState(0.8);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [moving, setMoving] = useState<Concept | null>(null);
  const [motion, setMotion] = useState<Concept[] | null>(null);
  const motionRef = useRef<Concept[] | null>(null);
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const drag = useRef<{
    id: string;
    x: number;
    y: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const positions = defaultPositions.map((n) => {
    const saved = motion?.find(p => p.id === n.id) || game.nodePositions?.[n.id];
    return moving?.id === n.id
      ? moving
      : saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)
        ? {
            id: n.id,
            x: Math.max(70, Math.min(1730, saved.x)),
            y: Math.max(70, Math.min(1430, saved.y)),
          }
        : n;
  });
  const moveNodes = (id: string, x: number, y: number, save = false) => {
    const visibleNow = visibleConcepts(game);
    const start = (motionRef.current || positions).filter(p => visibleNow.has(p.id));
    const target = separateNodes(start.map(p => p.id === id ? { id, x, y } : p), id);
    cancelAnimationFrame(frame.current);
    if (save) onChange(g => ({ ...g, nodePositions: { ...g.nodePositions, ...Object.fromEntries(target.map(p => [p.id, { x: p.x, y: p.y }])) } }));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const began = performance.now();
    const tick = (now: number) => {
      const t = reduced ? 1 : Math.min(1, (now - began) / 220);
      const ease = 1 - Math.pow(1 - t, 3);
      const current = target.map(p => {
        const old = start.find(n => n.id === p.id) || p;
        return p.id === id ? p : { id: p.id, x: old.x + (p.x - old.x) * ease, y: old.y + (p.y - old.y) * ease };
      });
      motionRef.current = current;
      setMotion(current);
      if (t < 1) frame.current = requestAnimationFrame(tick);
      else if (save) { motionRef.current = null; setMotion(null); }
    };
    frame.current = requestAnimationFrame(tick);
  };
  const savePosition = (id: string, x: number, y: number) => moveNodes(id, x, y, true);
  const free =
    game.population - Object.values(game.workers).reduce((a, b) => a + b, 0);
  const job = jobs.find((j) => j.id === selected);
  const resource = selected ? resources[selected] : undefined;
  const heat = heatSupply(game);
  const wood = woodGathering(game);
  const equipment = equipmentUse(game);
  const stoneConsumption = ratePreview(game).toolConsumption;
  const consumption = (job: string, resource: string) =>
    game.paused
      ? 0
      : resource === 'tools'
        ? stoneConsumption[job] || 0
        : (equipment.byJob[job]?.[resource] || 0) /
          (resource === 'sticks' ? 20 : 1000);
  const perSecond = (value: number) =>
    value.toLocaleString('en', { maximumFractionDigits: 4 });
  const animals = herdActivity(game);
  const concepts: Record<
    string,
    { name: string; description: string; summary: string }
  > = {
    goats: {
      name: 'Goat herd',
      description: `Establishment: ${number((game.herd?.establishment || 0) * 100)}%. ${number(animals.tended)} goats tended, producing ${number(animals.output)} food/s and consuming ${number(animals.feed)} food/s. Keepers automatically grow the herd toward enclosure capacity. Animals remain safe when food or labour runs out.`,
      summary: `${number(game.herd?.goats || 0)} / ${animals.capacity} goats`,
    },
    enclosures: {
      name: 'Enclosures',
      description: `Each enclosure holds 8 goats and costs 20 wood plus 10 cord. Builders keep construction progress during shortages. Next enclosure: ${number((game.herd?.enclosureProgress || 0) * 100)}%.`,
      summary: `${game.herd?.enclosures || 0} built · ${number((game.herd?.enclosureProgress || 0) * 100)}% next`,
    },
    shelters: {
      name: 'Shelters',
      description: `${game.shelters || 0} completed shelters provide ${((game.shelters || 0) + (game.upgradedShelters || 0)) * 2} extra population spaces. The original camp supports 10 people; current total capacity is ${housing(game)}. Upgraded dwellings: ${game.upgradedShelters || 0}. Next shelter: ${number((game.shelterProgress || 0) * 100)}%. Upgrade progress: ${number((game.dwellingProgress || 0) * 100)}%. Builders work automatically and keep their progress when supplies run out.`,
      summary: `${game.shelters || 0} built · ${number((game.shelterProgress || 0) * 100)}% next`,
    },
    heat: {
      name: 'Heat',
      description: `${number(heat.supply)} heat/s supplied; ${number(heat.cookingUsed)} used by cooking and ${number(heat.potteryUsed)} by pottery out of ${number(heat.demand)} needed. Surplus heat dissipates; it is never stockpiled. Each hearth keeper burns 0.5 wood/s for 4 heat/s.`,
      summary: `${number(heat.supply)} supply / ${number(heat.used)} used`,
    },
    cooking: {
      name: 'Cooking',
      description:
        'Automatic cooking needs 1 heat/s per assigned food worker. Full heat improves food output by 20%; shortages reduce the bonus proportionally. Hunting, gathering and farming continue without heat.',
      summary: `+${number(heat.bonus * 100)}% food`,
    },
  };
  const name = (id: string) =>
    id === 'population'
      ? 'Your people'
      : jobs.find((j) => j.id === id)?.name ||
        resources[id]?.name ||
        concepts[id]?.name ||
        id;
  const visible = visibleConcepts(game);
  const availableJobs = jobs.filter((j) => visible.has(j.id));
  const matches = (id: string) =>
    name(id).toLowerCase().includes(query.trim().toLowerCase()) &&
    (category === 'all' ||
      (category === 'resources'
        ? !!resources[id]
        : category === 'people'
          ? id === 'population'
          : jobs.some((j) => j.id === id)));
  const filtering = query.trim() !== '' || category !== 'all';
  let edges = availableJobs.flatMap((j) => [
    ...Object.entries(jobInputs(game, j.id)).map(([k, v]) => ({
      from: k,
      to: j.id,
      label: `${number(v)}/s per worker`,
      kind: 'input',
    })),
    ...Object.entries(j.output).map(([k, v]) => ({
      from: j.id,
      to: k,
      label: `${number(v)}/s per worker`,
      kind: 'output',
    })),
  ]);
  if (visible.has('heat'))
    edges.push(
      {
        from: 'hearthkeeper',
        to: 'heat',
        label: '4 heat/s per worker with fuel',
        kind: 'output',
      },
      {
        from: 'heat',
        to: 'cooking',
        label: `${number(heat.cookingUsed)} heat/s used`,
        kind: 'input',
      },
      {
        from: 'cooking',
        to: 'food',
        label: `+${number(heat.bonus * 100)}% food output`,
        kind: 'output',
      },
    );
  if (visible.has('wood'))
    edges.push({
      from: 'gatherer',
      to: 'wood',
      label: 'Chance find: 1 wood · 6% per effective worker-second',
      kind: 'output',
    });
  edges.push({
    from: 'food',
    to: 'population',
    label: `${number(game.population * 0.15)} food/s upkeep · ${workerCost(game)} food grows population automatically`,
    kind: 'input',
  });
  if (visible.has('potter'))
    edges.push({
      from: 'heat',
      to: 'potter',
      label: `${number(heat.potteryUsed)} / ${number(heat.potteryDemand)} heat/s`,
      kind: 'input',
    });
  for (const j of availableJobs) {
    if (j.id === 'animalkeeper')
      edges.push(
        {
          from: 'food',
          to: 'animalkeeper',
          label: `${number(animals.feed)} food/s feeding`,
          kind: 'input',
        },
        {
          from: 'animalkeeper',
          to: 'goats',
          label: 'Establish and tend herd automatically',
          kind: 'output',
        },
        {
          from: 'enclosures',
          to: 'goats',
          label: `${animals.capacity} goat capacity`,
          kind: 'output',
        },
        {
          from: 'goats',
          to: 'food',
          label: `${number(animals.output)} food/s`,
          kind: 'output',
        },
      );
    for (const key of j.id === 'hunter'
      ? ['spears']
      : j.id === 'fisher'
        ? ['spears', 'nets']
        : ['gatherer', 'woodcutter'].includes(j.id)
          ? ['baskets']
          : [])
      if (visible.has(key))
        edges.push({
          from: key,
          to: j.id,
          label:
            key === 'nets'
              ? `${perSecond(consumption(j.id, key))} nets/s consumed · +75% food per equipped worker`
              : j.id === 'woodcutter'
                ? `+${number(wood.basketBonus * 100)}% wood gathering efficiency`
                : `Equipment · current total +${number(stickBonus(game, j.id) * 100)}% food`,
          kind: key === 'nets' ? 'input' : 'effect',
        });
    // Shelter capacity remains visible even when no builders are assigned.
    if (visible.has('sticks') && ['hunter', 'fisher'].includes(j.id))
      edges.push({
        from: 'sticks',
        to: j.id,
        label: `${perSecond(consumption(j.id, 'sticks'))} wooden tools/s consumed · +${game.tech.includes('spearmaking') ? 50 : 25}% food per equipped worker`,
        kind: 'input',
      });
    edges.push({
      from: 'tools',
      to: j.id,
      label:
        j.id === 'woodcutter' && game.tech.includes('stoneaxes')
          ? `${perSecond(consumption(j.id, 'tools'))} stone tools/s consumed · +100% wood per equipped worker`
          : `${perSecond(consumption(j.id, 'tools'))} stone tools/s consumed · +${number(stoneEfficiency(game) * 100)}% productivity`,
      kind: 'input',
    });
    if (visible.has('clothing'))
      edges.push({
        from: 'clothing',
        to: j.id,
        label: `+${number(Math.min(0.25, game.stock.clothing / 200) * 100)}% productivity`,
        kind: 'effect',
      });
  }
  edges = edges.filter((e) => visible.has(e.from) && visible.has(e.to));
  if (visible.has('shelters'))
    edges.push({
      from: 'shelters',
      to: 'population',
      label: `+${((game.shelters || 0) + (game.upgradedShelters || 0)) * 2} population capacity`,
      kind: 'output',
    });
  const connected = edges.filter(
    (e) => e.from === selected || e.to === selected,
  );
  const neighbors = new Set(connected.flatMap((e) => [e.from, e.to]));
  const inputs = connected.filter((e) => e.to === selected),
    outputs = connected.filter((e) => e.from === selected);
  const isLocked = (id: string) => {
    const j = jobs.find((j) => j.id === id);
    return !!j && !unlocked(game, j.tech);
  };
  const icon = (id: string) => {
    const j = jobs.find((j) => j.id === id);
    return id === 'population' ? (
      <Users />
    ) : id === 'knapper' ? (
      <Hand />
    ) : j ? (
      j.group === 'food' ? (
        <Sprout />
      ) : j.group === 'gather' ? (
        <Pickaxe />
      ) : j.group === 'knowledge' ? (
        <BookOpen />
      ) : (
        <Hammer />
      )
    ) : (
      <span className="concept-symbol">
        {resources[id]?.symbol || (id === 'shelters' ? '⌂' : '♨')}
      </span>
    );
  };
  return (
    <section
      className="concept-explorer"
      aria-label="Settlement concept network"
    >
      <div className="map-toolbar">
        <div>
          <h2>Your living settlement</h2>
          <p>
            Drag nodes to organise them. Select one to follow its connections.
            Shift + arrow keys also moves a focused node.
          </p>
        </div>
        <div className="map-zoom">
          <button
            aria-label="Zoom out"
            disabled={zoom <= 0.5}
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
          >
            −
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button
            aria-label="Zoom in"
            disabled={zoom >= 1.3}
            onClick={() => setZoom((z) => Math.min(1.3, z + 0.1))}
          >
            +
          </button>
          <button
            aria-label="Reset map view"
            onClick={() => {
              setZoom(0.8);
              setSelected(null);
            }}
          >
            <Focus size={18} />
          </button>
        </div>
      </div>
      {ready && showNeeds && (
        <section className="settlement-needs" aria-label="Settlement needs">
          <div className="needs-heading">
            <strong>Settlement needs</strong>
            <button
              onClick={() =>
                onChange((g) => ({
                  ...g,
                  settings: {
                    showHuntingGuide: g.settings?.showHuntingGuide ?? true,
                    ...g.settings,
                    showSettlementNeeds: false,
                  },
                }))
              }
            >
              Hide
            </button>
          </div>
          {game.paused && (
            <p>
              Time is paused. Assign workers, then press Play to see production
              needs.
            </p>
          )}
          {needs.length ? (
            <div className="needs-items">
              {needs.map((need, i) => (
                <button
                  key={`${need.node}-${i}`}
                  onClick={() => {
                    setSelected(need.node);
                    setQuery('');
                    setCategory('all');
                    requestAnimationFrame(() =>
                      document
                        .getElementById(`concept-${need.node}`)
                        ?.scrollIntoView({
                          block: 'nearest',
                          inline: 'nearest',
                        }),
                    );
                  }}
                >
                  {need.message} <ArrowRight size={14} />
                </button>
              ))}
            </div>
          ) : (
            <p>
              {game.paused
                ? 'Your people are assigned.'
                : 'No immediate needs detected.'}
            </p>
          )}
        </section>
      )}
      <div className="map-search-tools">
        <Input
          aria-label="Search discovered nodes"
          placeholder="Search discovered nodes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {['all', 'resources', 'occupations', 'people'].map((c) => (
          <button
            key={c}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
        <span role="status">
          {positions.filter((n) => visible.has(n.id) && matches(n.id)).length}{' '}
          matches
        </span>
        <button
          onClick={() => {
            setQuery('');
            setCategory('all');
          }}
        >
          Clear filters
        </button>
        <button
          disabled={!ready}
          onClick={() => onChange((g) => ({ ...g, nodePositions: {} }))}
        >
          Reset layout
        </button>
      </div>
      <div className="map-legend">
        <span>
          <i className="legend-work" /> Work
        </span>
        <span>
          <i className="legend-resource" /> Resources
        </span>
        <span className="in-color">→ Into selected</span>
        <span className="out-color">→ Out of selected</span>
        <span>Dashed → productivity effect</span>
      </div>
      <div className={`map-body${showSidebar ? '' : ' map-body-expanded'}`}>
        <div
          className="map-scroll"
          tabIndex={0}
          aria-label="Scrollable concept map. Use arrow keys or scroll to explore."
        >
          <div style={{ width: 1800 * zoom, height: 1500 * zoom }}>
            <div
              className="concept-canvas"
              style={{ transform: `scale(${zoom})` }}
            >
              <span className="map-region" style={{ left: 70, top: 20 }}>
                LAND & LIVELIHOOD
              </span>
              <span className="map-region" style={{ left: 760, top: 20 }}>
                CRAFT & COMMUNITY
              </span>
              <svg
                className="concept-lines"
                viewBox="0 0 1800 1500"
                aria-hidden="true"
              >
                <defs>
                  {['in', 'out', 'quiet'].map((c) => (
                    <marker
                      key={c}
                      id={`arrow-${c}`}
                      viewBox="0 0 10 10"
                      refX="9"
                      refY="5"
                      markerWidth="7"
                      markerHeight="7"
                      orient="auto-start-reverse"
                    >
                      <path
                        d="M 0 0 L 10 5 L 0 10 z"
                        fill={
                          c === 'in'
                            ? '#e0ad7c'
                            : c === 'out'
                              ? '#97cfb1'
                              : '#4c6662'
                        }
                      />
                    </marker>
                  ))}
                </defs>
                {edges
                  .filter(
                    (e) =>
                      e.kind !== 'effect' ||
                      e.from === selected ||
                      e.to === selected,
                  )
                  .map((e, i) => {
                    const a = positions.find((n) => n.id === e.from)!,
                      b = positions.find((n) => n.id === e.to)!;
                    const dx = b.x - a.x,
                      dy = b.y - a.y,
                      len = Math.max(1, Math.hypot(dx, dy)),
                      r = 64;
                    const focus =
                      e.to === selected
                        ? 'in'
                        : e.from === selected
                          ? 'out'
                          : 'quiet';
                    return (
                      <path
                        key={`${e.from}-${e.to}-${i}`}
                        d={`M ${a.x + (dx / len) * r} ${a.y + (dy / len) * r} L ${b.x - (dx / len) * r} ${b.y - (dy / len) * r}`}
                        className={`connection ${focus} ${e.kind === 'effect' ? 'effect' : ''} ${selected && focus === 'quiet' ? 'faded' : ''}`}
                        markerEnd={`url(#arrow-${focus})`}
                      />
                    );
                  })}
              </svg>
              {positions
                .filter((n) => visible.has(n.id))
                .map((n) => {
                  const j = jobs.find((j) => j.id === n.id),
                    r = resources[n.id],
                    locked = isLocked(n.id);
                  return (
                    <button
                      key={n.id}
                      id={`concept-${n.id}`}
                      className={`concept-node ${['food', 'shelters', 'goats', 'enclosures'].includes(n.id) ? 'food-node' : ''} ${j ? 'work-node' : 'resource-node'} ${n.id === 'population' ? 'people-node' : ''} ${selected === n.id ? 'selected' : ''} ${selected && !neighbors.has(n.id) && selected !== n.id ? 'dimmed' : ''} ${locked ? 'locked' : ''}`}
                      style={
                        {
                          left: n.x,
                          top: n.y,
                          '--node-color': r?.color || '#a4c4b2',
                        } as CSSProperties
                      }
                      aria-pressed={selected === n.id}
                      aria-label={`${name(n.id)}${locked ? ', locked' : ''}. ${j ? `${game.workers[n.id] || 0} workers` : r ? `${number(game.stock[n.id])} stored` : `${game.population} settlers`}. Show connections`}
                      data-search-match={filtering ? matches(n.id) : undefined}
                      onPointerDown={(e) => {
                        if (!ready || e.button !== 0) return;
                        suppressClick.current = false;
                        drag.current = {
                          id: n.id,
                          x: n.x,
                          y: n.y,
                          startX: e.clientX,
                          startY: e.clientY,
                          moved: false,
                        };
                        e.currentTarget.setPointerCapture(e.pointerId);
                      }}
                      onPointerMove={(e) => {
                        const d = drag.current;
                        if (!d || d.id !== n.id) return;
                        const dx = e.clientX - d.startX,
                          dy = e.clientY - d.startY;
                        if (Math.hypot(dx, dy) > 5) d.moved = true;
                        if (d.moved) {
                          moveNodes(n.id, d.x + dx / zoom, d.y + dy / zoom);
                          setMoving({
                            id: n.id,
                            x: Math.max(70, Math.min(1730, d.x + dx / zoom)),
                            y: Math.max(70, Math.min(1430, d.y + dy / zoom)),
                          });
                        }
                      }}
                      onPointerUp={(e) => {
                        const d = drag.current;
                        if (!d) return;
                        suppressClick.current = d.moved;
                        if (d.moved)
                          savePosition(
                            d.id,
                            d.x + (e.clientX - d.startX) / zoom,
                            d.y + (e.clientY - d.startY) / zoom,
                          );
                        drag.current = null;
                        setMoving(null);
                      }}
                      onPointerCancel={() => {
                        cancelAnimationFrame(frame.current);
                        motionRef.current = null;
                        setMotion(null);
                        drag.current = null;
                        setMoving(null);
                        suppressClick.current = true;
                      }}
                      onKeyDown={(e) => {
                        if (
                          !ready ||
                          !e.shiftKey ||
                          ![
                            'ArrowLeft',
                            'ArrowRight',
                            'ArrowUp',
                            'ArrowDown',
                          ].includes(e.key)
                        )
                          return;
                        e.preventDefault();
                        savePosition(
                          n.id,
                          n.x +
                            (e.key === 'ArrowRight'
                              ? 20
                              : e.key === 'ArrowLeft'
                                ? -20
                                : 0),
                          n.y +
                            (e.key === 'ArrowDown'
                              ? 20
                              : e.key === 'ArrowUp'
                                ? -20
                                : 0),
                        );
                      }}
                      onClick={(e) => {
                        if (e.detail === 0 || !suppressClick.current)
                          setSelected(n.id);
                        suppressClick.current = false;
                      }}
                    >
                      {['goats', 'enclosures'].includes(n.id) && (
                        <span
                          aria-hidden="true"
                          className="food-growth-fill"
                          style={{
                            height: `${100 * (n.id === 'goats' ? (game.herd?.goats ? Math.min(1, game.herd.goats / Math.max(1, animals.capacity)) : game.herd?.establishment || 0) : game.herd?.enclosureProgress || 0)}%`,
                          }}
                        />
                      )}
                      {n.id === 'shelters' && (
                        <span
                          aria-hidden="true"
                          className="food-growth-fill"
                          style={{
                            height: `${(game.shelterProgress || 0) * 100}%`,
                          }}
                        />
                      )}
                      {n.id === 'food' && (
                        <span
                          aria-hidden="true"
                          className="food-growth-fill"
                          style={{
                            height: `${Math.min(100, (game.stock.food / workerCost(game)) * 100)}%`,
                          }}
                        />
                      )}
                      {locked ? <LockKeyhole size={20} /> : icon(n.id)}
                      <strong>{name(n.id)}</strong>
                      <small>
                        {locked
                          ? 'Undiscovered'
                          : j
                            ? `${game.workers[n.id] || 0} ${waitingForFood(game, n.id) ? 'assigned' : 'working'}`
                            : r
                              ? n.id === 'food'
                                ? `${number(game.stock.food)} / ${workerCost(game)}`
                                : number(game.stock[n.id])
                              : concepts[n.id]?.summary ||
                                `${game.population} settlers`}
                      </small>
                      {j && blocked.includes(j.id) && (
                        <span className="node-shortage">
                          {waitingForFood(game, n.id)
                            ? 'Waiting for food'
                            : j.id === 'potter'
                              ? 'Needs clay or heat'
                              : 'Needs inputs'}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
        {showSidebar && (
          <aside
            className="concept-detail"
            aria-label="Selected concept details"
          >
            {!selected ? (
              showHuntingGuide ? (
                <div className="map-empty">
                  <button
                    className="dismiss-guide"
                    aria-label="Disable Explore hunting guide"
                    onClick={onDismissGuide}
                  >
                    <X size={16} /> Hide guide
                  </button>
                  <span className="eyebrow">FOLLOW THE CONNECTIONS</span>
                  <h3>Give your people their first jobs.</h3>
                  <p>
                    Your village starts paused. Select Hunter or Gatherer and
                    assign a few people using the worker slider. Then press the
                    play button at the top to unpause and begin collecting food.
                  </p>
                  <button onClick={() => setSelected('hunter')}>
                    Explore hunting <ArrowRight size={17} />
                  </button>
                  <button onClick={() => setSelected('gatherer')}>
                    Explore gathering <ArrowRight size={17} />
                  </button>
                  <p className="map-hint">
                    Click any circle. Then follow a connected concept from this
                    panel.
                  </p>
                </div>
              ) : (
                <p className="map-hint">Select a node to view its details.</p>
              )
            ) : (
              <>
                <div className="detail-heading">
                  <span className="eyebrow">
                    {job
                      ? 'WORK & PRODUCTION'
                      : resource
                        ? 'RESOURCE'
                        : 'COMMUNITY'}
                  </span>
                  <button
                    aria-label="Clear selected concept"
                    onClick={() => setSelected(null)}
                  >
                    <X size={18} />
                  </button>
                </div>
                <h3>{name(selected)}</h3>
                <p>
                  {(job?.id === 'shelterbuilder' &&
                  game.tech.includes('dwellings')
                    ? `Currently ${upgradingShelter(game) ? 'upgrading a shelter with wood, clay and fibres' : 'building a basic shelter'}. Each upgrade uses 30 wood, 20 clay and 10 fibres and raises its capacity from 2 to 4 people. Upgrade progress: ${number((game.dwellingProgress || 0) * 100)}%. Basic construction progress is preserved separately.`
                    : job?.id === 'animalkeeper' &&
                        game.tech.includes('herdmanagement')
                      ? 'Each keeper now tends up to 6 goats. Food and enclosure requirements still apply.' +
                        (game.tech.includes('breeding')
                          ? ' Breeding experience increases herd growth by 25%.'
                          : '')
                      : undefined) ||
                    (job?.id === 'woodcutter'
                      ? `${job.description} ${number(wood.equipped)} of ${wood.workers} workers have stone axes. Basket efficiency bonus: +${number(wood.basketBonus * 100)}%. Each used stone tool lasts about 20 working seconds.`
                      : undefined) ||
                    (job && ['woodworker', 'toolmaker'].includes(job.id)
                      ? job.description +
                        ' Production pauses at a reserve of ' +
                        toolReserve(
                          game,
                          job.id === 'woodworker' ? 'sticks' : 'tools',
                        ) +
                        ' tools and resumes as they are used.'
                      : undefined) ||
                    job?.description ||
                    (selected === 'sticks'
                      ? `${number(game.stock.sticks || 0)} wooden tools available. Each equipped hunter or fisher gains ${game.tech.includes('spearmaking') ? 50 : 25}% food yield. Spear-making improves these tools without a separate stockpile. Each wooden tool lasts about 20 working seconds and is automatically replaced from stock.`
                      : undefined) ||
                    concepts[selected]?.description ||
                    (resource
                      ? `${number(game.stock[selected])} stored / ${number(capacity(game, selected))} capacity.`
                      : 'Food sustains the village and welcomes new settlers. Assign idle people to the work your village needs.')}
                </p>
                {job &&
                  (isLocked(job.id) ? (
                    <div className="node-locked-note">
                      <LockKeyhole size={16} /> Discover{' '}
                      {technologies.find((t) => t.id === job.tech)?.name}{' '}
                      through everyday work to unlock this job.
                    </div>
                  ) : (
                    <div className="assignment-control">
                      <label id="worker-label">
                        Assigned workers{' '}
                        <strong>{game.workers[job.id] || 0}</strong>
                      </label>
                      <Slider
                        aria-labelledby="worker-label"
                        min={0}
                        max={Math.max(1, (game.workers[job.id] || 0) + free)}
                        step={1}
                        value={[game.workers[job.id] || 0]}
                        disabled={
                          !ready || (game.workers[job.id] || 0) + free === 0
                        }
                        onValueChange={(value) => {
                          const v = Array.isArray(value) ? value[0] : value;
                          onChange((g) =>
                            assign(g, job.id, v - (g.workers[job.id] || 0)),
                          );
                        }}
                      />
                      <div className="assignment-input">
                        <input
                          aria-label={`Workers assigned to ${job.name}`}
                          type="number"
                          min={0}
                          max={(game.workers[job.id] || 0) + free}
                          value={game.workers[job.id] || 0}
                          disabled={!ready}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            onChange((g) =>
                              assign(g, job.id, v - (g.workers[job.id] || 0)),
                            );
                          }}
                        />
                        <span>{free} people available</span>
                      </div>
                      <button
                        disabled={!game.workers[job.id]}
                        onClick={() =>
                          onChange((g) =>
                            assign(g, job.id, -(g.workers[job.id] || 0)),
                          )
                        }
                      >
                        Release workers
                      </button>
                      {blocked.includes(job.id) && (
                        <p className="shortage-note">
                          {waitingForFood(game, job.id)
                            ? 'Waiting for a positive food rate after village upkeep and job inputs. Assign more food producers to activate this job.'
                            : 'Production is limited by missing inputs.'}
                        </p>
                      )}
                    </div>
                  ))}
                {selected === 'pottery' && (
                  <p>Each stored vessel adds 2 capacity to every resource.</p>
                )}
                {[
                  { title: 'COMING IN', list: inputs, cls: 'in-color' },
                  { title: 'GOING OUT', list: outputs, cls: 'out-color' },
                ].map((group) => (
                  <div className="connection-group" key={group.title}>
                    <h4 className={group.cls}>{group.title}</h4>
                    {group.list.length ? (
                      group.list.map((e, i) => (
                        <button
                          key={i}
                          onClick={() =>
                            setSelected(e.to === selected ? e.from : e.to)
                          }
                        >
                          <span>
                            {name(e.to === selected ? e.from : e.to)}{' '}
                            <ArrowRight size={14} />
                          </span>
                          <small>
                            {e.label}
                            {e.kind === 'effect' ? '' : ' · base rate'}
                          </small>
                        </button>
                      ))
                    ) : (
                      <p>
                        {job
                          ? 'No resource inputs. Workers gather directly.'
                          : 'No direct production connections.'}
                      </p>
                    )}
                  </div>
                ))}
                <p className="map-hint">
                  Production rates include inputs and outputs per worker before
                  bonuses. Dashed lines show bonuses, not consumption.
                </p>
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  );
}
