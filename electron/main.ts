import { app, BrowserWindow, ipcMain, Tray, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL 
  ? path.join(process.env.APP_ROOT, 'public') 
  : path.join(process.env.APP_ROOT, 'dist');

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let minimizeToTray = false;
let isQuitting = false;
let trayData = { battery: { left: null, right: null, case: null, inCaseL: false, inCaseR: false }, ancMode: 0, inEarL: false, inEarR: false };
let pythonDaemon: any = null;
let mockServer: any = null;


app.commandLine.appendSwitch('enable-web-bluetooth', 'true');
app.commandLine.appendSwitch('enable-experimental-web-platform-features', 'true');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1250,
    height: 950,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0F0F11',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      experimentalFeatures: true,
    },
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer Console] ${message} (line ${line} in ${sourceId})`);
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('close', (event) => {
    if (minimizeToTray && !isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(process.env.APP_ROOT, 'dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.on('set-minimize-to-tray', (event, enabled) => {
    minimizeToTray = enabled;
  });

  ipcMain.on('update-tray-tooltip', (event, text) => {
    if (tray) tray.setToolTip(text);
  });

  ipcMain.on('update-tray-menu', (event, data) => {
    trayData = data;
    buildTrayMenu();
  });

  function buildTrayMenu() {
    if (!tray) return;

    const b = trayData.battery;
    const parts = [
      `L: ${b.left ?? '--'}%`,
      `R: ${b.right ?? '--'}%`
    ];
    if ((b.inCaseL || b.inCaseR) && b.case !== null) {
      parts.push(`Case: ${b.case}%`);
    }
    let batteryText = parts.join(' | ');

    const ancMode = trayData.ancMode;
    const contextMenu = Menu.buildFromTemplate([
      { label: batteryText, enabled: false },
      { type: 'separator' },
      { label: 'Noise Cancellation', type: 'radio', checked: ancMode === 1, click: () => sendMotoCommand({ op: 'anc', mode: 1 }) },
      { label: 'Transparency', type: 'radio', checked: ancMode === 2, click: () => sendMotoCommand({ op: 'anc', mode: 2 }) },
      { label: 'Adaptive', type: 'radio', checked: ancMode === 3, click: () => sendMotoCommand({ op: 'anc', mode: 3 }) },
      { label: 'Off', type: 'radio', checked: ancMode === 0, click: () => sendMotoCommand({ op: 'anc', mode: 0 }) },
      { type: 'separator' },
      { label: 'Open MotoBudsController', click: () => mainWindow?.show() },
      { label: 'Quit', click: () => { isQuitting = true; app.quit(); } }
    ]);
    tray.setContextMenu(contextMenu);
  }

  const iconPath = app.isPackaged ? path.join(process.resourcesPath, 'build/icon.png') : path.join(process.env.APP_ROOT!, 'build/icon.png');
  tray = new Tray(iconPath);
  tray.setToolTip('Moto Buds');
  buildTrayMenu();

  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
    }
  });

  function sendMotoCommand(cmdObj: any) {
    if (pythonDaemon) {
       try {
          pythonDaemon.stdin.write(JSON.stringify(cmdObj) + '\n');
       } catch (e) {}
    }
  }


  if (process.platform === 'linux') {
     try {
        spawn('bluetoothctl', ['trust', '54:84:50:92:78:AE'], { stdio: 'ignore' });
     } catch (e) {
        console.error("Failed to trust device", e);
     }
  }

  ipcMain.handle('start-daemon', async (event, devMode?: boolean) => {
    return new Promise((resolve) => {
      if (pythonDaemon) {
        resolve({ status: 'success', message: 'Daemon already running' });
        return;
      }
      
      const isWin = process.platform === 'win32';
      const bundledPythonDir = app.isPackaged 
        ? path.join(process.resourcesPath, 'backend', 'win-python') 
        : path.join(process.env.APP_ROOT!, 'backend', 'win-python');
      
      const pythonPath = app.isPackaged 
        ? (isWin ? path.join(bundledPythonDir, 'python.exe') : 'python3')
        : path.join(process.env.APP_ROOT!, isWin ? '.venv\\Scripts\\python.exe' : '.venv/bin/python');
      
      const scriptPath = app.isPackaged ? path.join(process.resourcesPath, 'backend/moto_control.py') : path.join(process.env.APP_ROOT!, 'backend/moto_control.py');
      const cwdPath = app.isPackaged ? process.resourcesPath : process.env.APP_ROOT;
      
      const args = [scriptPath, '--daemon', '--json'];
      if (devMode) {
         args.push('--mac', '127.0.0.1', '--port', '5001');
         if (!mockServer) {
            const mockPath = app.isPackaged ? path.join(process.resourcesPath, 'backend/mock_earbuds.py') : path.join(process.env.APP_ROOT!, 'backend/mock_earbuds.py');
            mockServer = spawn(pythonPath, [mockPath], { cwd: cwdPath });
         }
      }

      pythonDaemon = spawn(pythonPath, args, { cwd: cwdPath });
      
      pythonDaemon.stdout.on('data', (data: Buffer) => {
         const str = data.toString();
         const lines = str.split('\n').filter(l => l.trim().length > 0);
         for (const line of lines) {
            try {
               const payload = JSON.parse(line);
               // If it's the initial connection status, resolve the promise
               if (payload.type === 'status' && payload.status === 'connected') {
                  resolve({ status: 'success' });
               } else if (payload.type === 'error') {
                  console.error('Python daemon error:', payload.message);
                  resolve({ status: 'error', message: payload.message });
               }
               
               // Route all events to frontend (including status and errors for reconnect logic)
               if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
                  mainWindow.webContents.send('moto-event', payload);
               }
            } catch (e) {
               console.error("Failed to parse daemon output:", line);
            }
         }
      });
      
      pythonDaemon.stderr.on('data', (data: Buffer) => {
         console.error('Daemon stderr:', data.toString());
      });
      
      pythonDaemon.on('close', (code: number) => {
         console.log(`Python daemon exited with code ${code}`);
         pythonDaemon = null;
         if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
            mainWindow.webContents.send('moto-event', { type: 'error', message: 'Connection lost. Device disconnected.' });
         }
      });
    });
  });

  // IPC Handler for Moto Commands (now just routing to the daemon stdin)
  ipcMain.handle('moto-command', async (event, cmdObj: any) => {
    return new Promise((resolve) => {
      if (!pythonDaemon) {
         resolve({ status: 'error', message: 'Daemon is not running' });
         return;
      }
      
      try {
         // Write the command to the Python daemon's stdin
         pythonDaemon.stdin.write(JSON.stringify(cmdObj) + '\n');
         // We resolve immediately. The UI updates asynchronously when the daemon emits a moto-event
         resolve({ status: 'success' });
      } catch (e: any) {
         resolve({ status: 'error', message: e.message });
      }
    });
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  // Kill daemon if running
  try {
     if (pythonDaemon) {
         pythonDaemon.kill();
     }
     if (mockServer) {
         mockServer.kill();
     }
  } catch(e) {}
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
