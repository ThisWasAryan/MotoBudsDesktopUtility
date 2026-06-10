import { createRequire } from "node:module";
import { BrowserWindow, app, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
//#region \0rolldown/runtime.js
var __require = /* @__PURE__ */ createRequire(import.meta.url);
//#endregion
//#region electron/main.ts
var __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : path.join(process.env.APP_ROOT, "dist");
var mainWindow = null;
app.commandLine.appendSwitch("enable-web-bluetooth", "true");
app.commandLine.appendSwitch("enable-experimental-web-platform-features", "true");
function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1250,
		height: 950,
		titleBarStyle: "hiddenInset",
		backgroundColor: "#0F0F11",
		show: false,
		webPreferences: {
			preload: path.join(__dirname, "preload.mjs"),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: false,
			experimentalFeatures: true
		}
	});
	mainWindow.webContents.on("console-message", (event, level, message, line, sourceId) => {
		console.log(`[Renderer Console] ${message} (line ${line} in ${sourceId})`);
	});
	mainWindow.on("ready-to-show", () => {
		mainWindow?.show();
	});
	if (process.env.VITE_DEV_SERVER_URL) mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
	else mainWindow.loadFile(path.join(process.env.APP_ROOT, "dist/index.html"));
}
app.whenReady().then(() => {
	createWindow();
	if (process.platform === "linux") try {
		spawn("mpris-proxy", [], {
			stdio: "ignore",
			detached: true
		}).unref();
		spawn("bluetoothctl", ["trust", "54:84:50:92:78:AE"], { stdio: "ignore" });
	} catch (e) {
		console.error("Failed to start mpris-proxy or trust device", e);
	}
	let pythonDaemon = null;
	ipcMain.handle("start-daemon", async (event) => {
		return new Promise((resolve) => {
			if (pythonDaemon) {
				resolve({
					status: "success",
					message: "Daemon already running"
				});
				return;
			}
			const pythonPath = app.isPackaged ? "python3" : path.join(process.env.APP_ROOT, ".venv/bin/python");
			const scriptPath = app.isPackaged ? path.join(process.resourcesPath, "backend/moto_control.py") : path.join(process.env.APP_ROOT, "backend/moto_control.py");
			const cwdPath = app.isPackaged ? process.resourcesPath : process.env.APP_ROOT;
			pythonDaemon = spawn(pythonPath, [
				scriptPath,
				"--daemon",
				"--json"
			], { cwd: cwdPath });
			pythonDaemon.stdout.on("data", (data) => {
				const lines = data.toString().split("\n").filter((l) => l.trim().length > 0);
				for (const line of lines) try {
					const payload = JSON.parse(line);
					if (payload.type === "status" && payload.status === "connected") resolve({ status: "success" });
					else if (payload.type === "error") {
						console.error("Python daemon error:", payload.message);
						resolve({
							status: "error",
							message: payload.message
						});
					}
					if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) mainWindow.webContents.send("moto-event", payload);
				} catch (e) {
					console.error("Failed to parse daemon output:", line);
				}
			});
			pythonDaemon.stderr.on("data", (data) => {
				console.error("Daemon stderr:", data.toString());
			});
			pythonDaemon.on("close", (code) => {
				console.log(`Python daemon exited with code ${code}`);
				pythonDaemon = null;
				if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) mainWindow.webContents.send("moto-event", {
					type: "error",
					message: "Connection lost. Device disconnected."
				});
			});
		});
	});
	ipcMain.handle("moto-command", async (event, cmdObj) => {
		return new Promise((resolve) => {
			if (!pythonDaemon) {
				resolve({
					status: "error",
					message: "Daemon is not running"
				});
				return;
			}
			try {
				pythonDaemon.stdin.write(JSON.stringify(cmdObj) + "\n");
				resolve({ status: "success" });
			} catch (e) {
				resolve({
					status: "error",
					message: e.message
				});
			}
		});
	});
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});
app.on("window-all-closed", () => {
	try {
		const { execSync } = __require("child_process");
		execSync("pkill -f moto_control.py.*--daemon");
	} catch (e) {}
	if (process.platform !== "darwin") app.quit();
});
//#endregion
export {};
