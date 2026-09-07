'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Sparkles } from 'lucide-react';
import {
  ToastProvider,
  ToastPortal,
  ToastViewport,
  Toast,
  ToastContent,
  ToastTitle,
  ToastDescription,
  ToastClose,
  createToastManager,
  useToastManager,
} from '@/components/ui/toast';
import {
  compendium,
  technologies,
  jobs,
  resources,
  visibleConcepts,
  type Game,
} from '@/lib/game';
function CelebrationList() {
  const { toasts } = useToastManager();
  return (
    <ToastPortal>
      <ToastViewport className="discovery-toast-viewport">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} className="discovery-toast">
            <div className="discovery-confetti" aria-hidden="true">
              {Array.from({ length: 16 }, (_, i) => (
                <i
                  key={i}
                  style={
                    {
                      '--i': i,
                      '--drift': `${(i % 2 ? 1 : -1) * (30 + i * 7)}px`,
                      '--spin': `${i * 73}deg`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
            <ToastContent>
              <div className="celebration-emblem" aria-hidden="true">
                <Sparkles size={29} />
              </div>
              <div className="celebration-copy">
                <span>✦ A NEW DISCOVERY</span>
                <ToastTitle />
                <ToastDescription />
              </div>
              <ToastClose />
            </ToastContent>
          </Toast>
        ))}
      </ToastViewport>
    </ToastPortal>
  );
}
export default function DiscoveryCelebrations({
  game,
  ready,
}: {
  game: Game;
  ready: boolean;
}) {
  const [manager] = useState(() => createToastManager());
  const previous = useRef<Game | null>(null);
  const queue = useRef<{ title: string; description: string }[]>([]);
  const active = useRef(false);
  useEffect(() => {
    if (!ready) return;
    const old = previous.current;
    previous.current = game;
    if (!old) return;
    const added = game.tech.filter((id) => !old.tech.includes(id));
    const finds = (game.discoveries || []).filter(
      (id) => !old.discoveries?.includes(id),
    );
    for (const id of finds) {
      const entry = compendium.find((e) => e.id === id);
      if (entry)
        queue.current.push({
          title: entry.name,
          description: entry.description + ' Added to your compendium.',
        });
    }
    for (const id of added) {
      const tech = technologies.find((t) => t.id === id);
      if (tech)
        queue.current.push({ title: tech.name, description: tech.description });
    }
    const oldVisible = visibleConcepts(old);
    const currentVisible = visibleConcepts(game);
    for (const [id, resource] of Object.entries(resources)) {
      if (currentVisible.has(id) && !oldVisible.has(id))
        queue.current.push({
          title: resource.name,
          description: `A new resource is available: ${resource.name.toLowerCase()}. Select its node on the settlement map to explore its connections.`,
        });
    }
    const newJobs = jobs.filter(
      (j) => currentVisible.has(j.id) && !oldVisible.has(j.id),
    );
    for (const job of newJobs)
      queue.current.push({
        title: job.name,
        description:
          job.description +
          ' Select this new profession on the settlement map to assign people.',
      });
    const next = () => {
      if (active.current || !queue.current.length) return;
      active.current = true;
      const event = queue.current.shift()!;
      manager.add({
        ...event,
        timeout: 6500,
        priority: 'low',
        onRemove: () => {
          // The library removes the old toast after this callback returns.
          // Adding immediately changes its list indices and removes the new toast.
          queueMicrotask(() => {
            active.current = false;
            next();
          });
        },
      });
    };
    next();
  }, [game, ready, manager]);
  return (
    <ToastProvider toastManager={manager}>
      <CelebrationList />
    </ToastProvider>
  );
}
