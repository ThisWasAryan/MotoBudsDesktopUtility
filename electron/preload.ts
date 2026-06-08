import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // New Python Backend bridge
  motoCommand: (cmdObj: any) => ipcRenderer.invoke('moto-command', cmdObj),
  startDaemon: () => ipcRenderer.invoke('start-daemon'),
  onMotoEvent: (callback: (event: any, payload: any) => void) => {
    ipcRenderer.on('moto-event', callback);
  },
  removeMotoEventListener: (callback: (event: any, payload: any) => void) => {
    ipcRenderer.removeListener('moto-event', callback);
  },
  
  // Legacy stubs (keep to prevent type errors from old React code)
  onDeviceConnected: (callback) => ipcRenderer.on('device-connected', (_event, value) => callback(value)),
  onDeviceDisconnected: (callback) => ipcRenderer.on('device-disconnected', () => callback()),
  onStateUpdate: (callback) => ipcRenderer.on('state-update', (_event, value) => callback(value)),
  sendOpcode: (opcode, payload) => ipcRenderer.send('send-opcode', { opcode, payload }),
  triggerScan: () => ipcRenderer.send('trigger-scan'),
});
