import { contextBridge, ipcRenderer } from "electron";
//#region electron/preload.ts
contextBridge.exposeInMainWorld("api", {
	motoCommand: (cmdObj) => ipcRenderer.invoke("moto-command", cmdObj),
	startDaemon: () => ipcRenderer.invoke("start-daemon"),
	onMotoEvent: (callback) => {
		ipcRenderer.on("moto-event", callback);
	},
	removeMotoEventListener: (callback) => {
		ipcRenderer.removeListener("moto-event", callback);
	},
	onDeviceConnected: (callback) => ipcRenderer.on("device-connected", (_event, value) => callback(value)),
	onDeviceDisconnected: (callback) => ipcRenderer.on("device-disconnected", () => callback()),
	onStateUpdate: (callback) => ipcRenderer.on("state-update", (_event, value) => callback(value)),
	sendOpcode: (opcode, payload) => ipcRenderer.send("send-opcode", {
		opcode,
		payload
	}),
	triggerScan: () => ipcRenderer.send("trigger-scan")
});
//#endregion
export {};
