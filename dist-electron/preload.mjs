import { contextBridge as e, ipcRenderer as t } from "electron";
//#region electron/preload.ts
e.exposeInMainWorld("api", {
	motoCommand: (e) => t.invoke("moto-command", e),
	onDeviceConnected: (e) => t.on("device-connected", (t, n) => e(n)),
	onDeviceDisconnected: (e) => t.on("device-disconnected", () => e()),
	onStateUpdate: (e) => t.on("state-update", (t, n) => e(n)),
	sendOpcode: (e, n) => t.send("send-opcode", {
		opcode: e,
		payload: n
	}),
	triggerScan: () => t.send("trigger-scan")
});
//#endregion
export {};
