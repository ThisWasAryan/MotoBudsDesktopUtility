import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // New Python Backend bridge
  motoCommand: (args) => ipcRenderer.invoke('moto-command', args),
  
  // Legacy stubs (keep to prevent type errors from old React code)
  onDeviceConnected: (callback) => ipcRenderer.on('device-connected', (_event, value) => callback(value)),
  onDeviceDisconnected: (callback) => ipcRenderer.on('device-disconnected', () => callback()),
  onStateUpdate: (callback) => ipcRenderer.on('state-update', (_event, value) => callback(value)),
  sendOpcode: (opcode, payload) => ipcRenderer.send('send-opcode', { opcode, payload }),
  triggerScan: () => ipcRenderer.send('trigger-scan'),
});
