import { createRequire as e } from "node:module";
import { BrowserWindow as t, app as n, ipcMain as r } from "electron";
import i from "path";
import { fileURLToPath as a } from "url";
import { spawn as o } from "child_process";
//#region \0rolldown/runtime.js
var s = /* @__PURE__ */ e(import.meta.url), c = i.dirname(a(import.meta.url));
process.env.APP_ROOT = i.join(c, ".."), process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL ? i.join(process.env.APP_ROOT, "public") : i.join(process.env.APP_ROOT, "dist");
var l = null;
n.commandLine.appendSwitch("enable-web-bluetooth", "true"), n.commandLine.appendSwitch("enable-experimental-web-platform-features", "true");
function u() {
	l = new t({
		width: 1024,
		height: 768,
		titleBarStyle: "hiddenInset",
		backgroundColor: "#0F0F11",
		show: !1,
		webPreferences: {
			preload: i.join(c, "preload.mjs"),
			contextIsolation: !0,
			nodeIntegration: !1,
			sandbox: !1,
			experimentalFeatures: !0
		}
	}), l.webContents.on("console-message", (e, t, n, r, i) => {
		console.log(`[Renderer Console] ${n} (line ${r} in ${i})`);
	}), l.on("ready-to-show", () => {
		l?.show();
	}), process.env.VITE_DEV_SERVER_URL ? l.loadURL(process.env.VITE_DEV_SERVER_URL) : l.loadFile(i.join(process.env.APP_ROOT, "dist/index.html"));
}
n.whenReady().then(() => {
	u();
	let e = null;
	r.handle("start-daemon", async (t) => new Promise((t) => {
		if (e) {
			t({
				status: "success",
				message: "Daemon already running"
			});
			return;
		}
		let r = n.isPackaged ? "python3" : i.join(process.env.APP_ROOT, ".venv/bin/python"), a = n.isPackaged ? i.join(process.resourcesPath, "backend/moto_control.py") : i.join(process.env.APP_ROOT, "backend/moto_control.py"), s = n.isPackaged ? process.resourcesPath : process.env.APP_ROOT;
		e = o(r, [
			a,
			"--daemon",
			"--json"
		], { cwd: s }), e.stdout.on("data", (e) => {
			let n = e.toString().split("\n").filter((e) => e.trim().length > 0);
			for (let e of n) try {
				let n = JSON.parse(e);
				n.type === "status" && n.status === "connected" ? t({ status: "success" }) : n.type === "error" ? (console.error("Python daemon error:", n.message), t({
					status: "error",
					message: n.message
				})) : l && !l.isDestroyed() && l.webContents && l.webContents.send("moto-event", n);
			} catch {
				console.error("Failed to parse daemon output:", e);
			}
		}), e.stderr.on("data", (e) => {
			console.error("Daemon stderr:", e.toString());
		}), e.on("close", (t) => {
			console.log(`Python daemon exited with code ${t}`), e = null, l && !l.isDestroyed() && l.webContents && l.webContents.send("moto-event", {
				type: "error",
				message: "Connection lost. Device disconnected."
			});
		});
	})), r.handle("moto-command", async (t, n) => new Promise((t) => {
		if (!e) {
			t({
				status: "error",
				message: "Daemon is not running"
			});
			return;
		}
		try {
			e.stdin.write(JSON.stringify(n) + "\n"), t({ status: "success" });
		} catch (e) {
			t({
				status: "error",
				message: e.message
			});
		}
	})), n.on("activate", () => {
		t.getAllWindows().length === 0 && u();
	});
}), n.on("window-all-closed", () => {
	try {
		let { execSync: e } = s("child_process");
		e("pkill -f moto_control.py.*--daemon");
	} catch {}
	process.platform !== "darwin" && n.quit();
});
//#endregion
export {};
