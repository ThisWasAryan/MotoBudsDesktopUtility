import { createRequire } from "node:module";
//#endregion
//#region electron/preload.ts
var { contextBridge, ipcRenderer } = (/* @__PURE__ */ createRequire(import.meta.url))("electron");
contextBridge.exposeInMainWorld("api", {
	motoCommand: (args) => ipcRenderer.invoke("moto-command", args),
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
