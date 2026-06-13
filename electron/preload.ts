import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  isWindows: process.platform === 'win32',
  // New Python Backend bridge
  motoCommand: (cmdObj: any) => ipcRenderer.invoke('moto-command', cmdObj),
  startDaemon: (devMode?: boolean) => ipcRenderer.invoke('start-daemon', devMode),
  onMotoEvent: (callback: (event: any, payload: any) => void) => {
    ipcRenderer.on('moto-event', callback);
  },
  removeMotoEventListener: (callback: (event: any, payload: any) => void) => {
    ipcRenderer.removeListener('moto-event', callback);
  },
  
  // Legacy stubs (keep to prevent type errors from old React code)
  onDeviceConnected: (callback: any) => ipcRenderer.on('device-connected', (_event, value) => callback(value)),
  onDeviceDisconnected: (callback: any) => ipcRenderer.on('device-disconnected', () => callback()),
  onStateUpdate: (callback: any) => ipcRenderer.on('state-update', (_event, value) => callback(value)),
  sendOpcode: (opcode: any, payload: any) => ipcRenderer.send('send-opcode', { opcode, payload }),
  triggerScan: () => ipcRenderer.send('trigger-scan'),

  // Tray Integration
  setMinimizeToTray: (enabled: boolean) => ipcRenderer.send('set-minimize-to-tray', enabled),
  updateTrayTooltip: (text: string) => ipcRenderer.send('update-tray-tooltip', text),
  updateTrayMenu: (data: any) => ipcRenderer.send('update-tray-menu', data),
});
