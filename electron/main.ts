import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL 
  ? path.join(process.env.APP_ROOT, 'public') 
  : path.join(process.env.APP_ROOT, 'dist');

let mainWindow: BrowserWindow | null = null;

app.commandLine.appendSwitch('enable-web-bluetooth', 'true');
app.commandLine.appendSwitch('enable-experimental-web-platform-features', 'true');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
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

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(process.env.APP_ROOT, 'dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  let pythonDaemon: any = null;

  ipcMain.handle('start-daemon', async (event) => {
    return new Promise((resolve) => {
      if (pythonDaemon) {
        resolve({ status: 'success', message: 'Daemon already running' });
        return;
      }
      
      const pythonPath = path.join(process.env.APP_ROOT!, '.venv/bin/python');
      const scriptPath = path.join(process.env.APP_ROOT!, 'backend/moto_control.py');
      
      pythonDaemon = spawn(pythonPath, [scriptPath, '--daemon', '--json'], { cwd: process.env.APP_ROOT });
      
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
               } else {
                  // Route all other async events, syncs, or info back to the frontend
                  if (mainWindow && mainWindow.webContents) {
                     mainWindow.webContents.send('moto-event', payload);
                  }
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
         if (mainWindow && mainWindow.webContents) {
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

app.on('window-all-closed', () => {
  // Kill daemon if running
  try {
     const { execSync } = require('child_process');
     execSync('pkill -f moto_control.py.*--daemon');
  } catch(e) {}
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
