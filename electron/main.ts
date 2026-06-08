import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

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

  // IPC Handler for Moto Commands
  ipcMain.handle('moto-command', async (event, args: string[]) => {
    return new Promise((resolve, reject) => {
      // Build the command line with Python venv
      const pythonPath = path.join(process.env.APP_ROOT!, '.venv/bin/python');
      const scriptPath = path.join(process.env.APP_ROOT!, 'backend/moto_control.py');
      
      const cmd = `${pythonPath} ${scriptPath} ${args.join(' ')} --json`;
      console.log(`Executing: ${cmd}`);

      exec(cmd, { cwd: process.env.APP_ROOT }, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          // Return a structured error
          return resolve({ status: 'error', message: error.message, stderr });
        }
        
        try {
          // Parse the JSON output from Python script
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (parseError) {
          console.error('Failed to parse python output:', stdout);
          resolve({ status: 'error', message: 'Invalid response from backend', raw: stdout });
        }
      });
    });
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
