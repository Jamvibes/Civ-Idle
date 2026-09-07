import type { Game } from './game';
export const SAVE_KEY: string;
export function createSaveStore(host: {
  localStorage: Storage;
  civDesktop?: {
    loadSave: () => Promise<string | null>;
    saveGame: (raw: string) => Promise<void>;
  };
}): {
  label: string;
  load: () => Promise<string | null>;
  save: (game: Game) => Promise<void>;
};
