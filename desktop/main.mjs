import { app, BrowserWindow, protocol, net, ipcMain, session } from 'electron';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDiskStore } from './save-store.mjs';
import { validSave } from './game.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const smoke = process.argv.includes('--smoke');
if (smoke) app.setPath('userData', path.join(app.getPath('temp'), 'civ-idle-smoke', String(process.pid)));
app.setName('Civ Idle');
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'civ',
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
]);
const origin = 'civ://game';
let window,
  store,
  closing = false;
const timeout = smoke
  ? setTimeout(() => {
      console.error('Desktop smoke test timed out');
      app.exit(1);
    }, 30000)
  : null;
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => {
    window?.restore();
    window?.focus();
  });
  app
    .whenReady()
    .then(async () => {
      store = createDiskStore(
        path.join(app.getPath('userData'), 'saves'),
        validSave,
      );
      const assets = path.join(here, '../web');
      protocol.handle('civ', async (request) => {
        const url = new URL(request.url);
        if (url.host !== 'game' || request.method !== 'GET')
          return new Response('Not found', { status: 404 });
        let requested;
        try {
          requested = decodeURIComponent(url.pathname);
        } catch {
          return new Response('Bad path', { status: 400 });
        }
        const filename = path.resolve(
          assets,
          '.' + (requested === '/' ? '/index.html' : requested),
        );
        const relative = path.relative(assets, filename);
        if (
          relative.startsWith('..') ||
          path.isAbsolute(relative) ||
          relative.includes(':')
        )
          return new Response('Forbidden', { status: 403 });
        try {
          return await net.fetch(pathToFileURL(filename).toString());
        } catch {
          return new Response('Not found', { status: 404 });
        }
      });
      session.defaultSession.setPermissionRequestHandler(
        (_webContents, _permission, callback) => callback(false),
      );
      session.defaultSession.setPermissionCheckHandler(() => false);
      session.defaultSession.webRequest.onBeforeRequest(
        { urls: ['http://*/*', 'https://*/*'] },
        (_details, callback) => callback({ cancel: true }),
      );
      const checkSender = (event) => {
        if (
          event.sender !== window.webContents ||
          event.senderFrame !== window.webContents.mainFrame ||
          !event.senderFrame.url.startsWith(origin + '/')
        )
          throw new Error('Untrusted save request');
      };
      ipcMain.handle('save:load', (event) => {
        checkSender(event);
        return store.load();
      });
      ipcMain.handle('save:write', async (event, raw) => {
        checkSender(event);
        await store.save(raw);
        if (smoke) {
          console.log(
            'DESKTOP_SMOKE_OK: bundled UI loaded, isolated save bridge persisted valid game',
          );
          clearTimeout(timeout);
          setTimeout(() => app.quit(), 100);
        }
      });
      window = new BrowserWindow({
        width: 1500,
        height: 980,
        minWidth: 850,
        minHeight: 650,
        title: 'Civ Idle',
        backgroundColor: '#121a1c',
        show: !smoke,
        autoHideMenuBar: true,
        webPreferences: {
          preload: path.join(here, 'preload.cjs'),
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: true,
        },
      });
      window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
      window.webContents.on('will-navigate', (event, url) => {
        if (!url.startsWith(origin + '/')) event.preventDefault();
      });
      window.webContents.on('will-attach-webview', (event) =>
        event.preventDefault(),
      );
      window.webContents.on('render-process-gone', (_event, details) => {
        console.error(details.reason);
        if (smoke) app.exit(1);
      });
      await window.loadURL(origin + '/');
    })
    .catch((error) => {
      console.error(error);
      app.exit(1);
    });
  app.on('window-all-closed', () => app.quit());
  app.on('before-quit', (event) => {
    if (store && !closing) {
      event.preventDefault();
      closing = true;
      store.flush().finally(() => app.quit());
    }
  });
}

