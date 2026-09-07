import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
export function createDiskStore(directory, validate) {
  const filename = path.join(directory, 'settlement.json');
  let pending = Promise.resolve();
  return {
    async load() {
      try {
        return await readFile(filename, 'utf8');
      } catch (error) {
        if (error.code === 'ENOENT') return null;
        throw error;
      }
    },
    save(raw) {
      if (typeof raw !== 'string' || Buffer.byteLength(raw) > 1024 * 1024)
        return Promise.reject(new Error('Invalid save size'));
      try {
        if (!validate(JSON.parse(raw))) throw new Error('Invalid save data');
      } catch (error) {
        return Promise.reject(error);
      }
      const operation = pending.then(async () => {
        await mkdir(directory, { recursive: true });
        await writeFile(filename + '.tmp', raw, 'utf8');
        await rename(filename + '.tmp', filename);
      });
      pending = operation.catch(() => {});
      return operation;
    },
    flush: () => pending,
  };
}
