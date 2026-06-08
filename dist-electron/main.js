import { BrowserWindow as e, app as t, ipcMain as n } from "electron";
import r from "path";
import { fileURLToPath as i } from "url";
import { exec as a } from "child_process";
//#region electron/main.ts
var o = r.dirname(i(import.meta.url));
process.env.APP_ROOT = r.join(o, ".."), process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL ? r.join(process.env.APP_ROOT, "public") : r.join(process.env.APP_ROOT, "dist");
var s = null;
t.commandLine.appendSwitch("enable-web-bluetooth", "true"), t.commandLine.appendSwitch("enable-experimental-web-platform-features", "true");
function c() {
	s = new e({
		width: 1024,
		height: 768,
		titleBarStyle: "hiddenInset",
		backgroundColor: "#0F0F11",
		show: !1,
		webPreferences: {
			preload: r.join(o, "preload.mjs"),
			contextIsolation: !0,
			nodeIntegration: !1,
			sandbox: !1,
			experimentalFeatures: !0
		}
	}), s.webContents.on("console-message", (e, t, n, r, i) => {
		console.log(`[Renderer Console] ${n} (line ${r} in ${i})`);
	}), s.on("ready-to-show", () => {
		s?.show();
	}), process.env.VITE_DEV_SERVER_URL ? s.loadURL(process.env.VITE_DEV_SERVER_URL) : s.loadFile(r.join(process.env.APP_ROOT, "dist/index.html"));
}
t.whenReady().then(() => {
	c(), n.handle("moto-command", async (e, t) => new Promise((e, n) => {
		let i = `${r.join(process.env.APP_ROOT, ".venv/bin/python")} ${r.join(process.env.APP_ROOT, "backend/moto_control.py")} ${t.join(" ")} --json`;
		console.log(`Executing: ${i}`), a(i, { cwd: process.env.APP_ROOT }, (t, n, r) => {
			if (t) return console.error(`exec error: ${t}`), e({
				status: "error",
				message: t.message,
				stderr: r
			});
			try {
				e(JSON.parse(n));
			} catch {
				console.error("Failed to parse python output:", n), e({
					status: "error",
					message: "Invalid response from backend",
					raw: n
				});
			}
		});
	})), t.on("activate", () => {
		e.getAllWindows().length === 0 && c();
	});
}), t.on("window-all-closed", () => {
	process.platform !== "darwin" && t.quit();
});
//#endregion
export {};
