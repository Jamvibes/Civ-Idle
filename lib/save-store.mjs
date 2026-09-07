export const SAVE_KEY = 'civ-idle-v1';
// Keep platform APIs out of the simulation and interface.
export function createSaveStore(host) {
  if (host.civDesktop)
    return {
      label: 'Saved on this computer',
      load: () => host.civDesktop.loadSave(),
      save: (game) => host.civDesktop.saveGame(JSON.stringify(game)),
    };
  return {
    label: 'Saved in this browser',
    load: async () => host.localStorage.getItem(SAVE_KEY),
    save: async (game) =>
      host.localStorage.setItem(SAVE_KEY, JSON.stringify(game)),
  };
}
