# Moto Buds Desktop Utility (Linux)

An open-source desktop utility for configuring and controlling Motorola Moto Buds on Linux. This project successfully reverse-engineers the proprietary Bluetooth communication protocol used by the official Android application and provides a beautiful, premium desktop UI.

## Current Architecture

We have successfully reverse-engineered the communication transport layer and the strict Protocol Data Unit (PDU) framing.

1. **Python SPP Daemon Backend (`backend/moto_control.py`)**
   - We discovered that the Moto Buds **do not use GATT over BLE** for primary control. Instead, they use **Classic Bluetooth SPP (RFCOMM)** over Port 16.
   - The backend runs as a permanent, long-lived multi-threaded daemon. The main thread continuously polls the active socket and instantly streams hardware events (like Battery Case states) to `stdout` as JSON. A background listener thread reads UI commands from `stdin` and routes them seamlessly through the active socket with zero latency, entirely eliminating any Bluetooth port contention.
   
2. **Electron / React Frontend**
   - A modern React application utilizing Vite, Electron IPC, and a mature, robust UI design. 
   - The UI spawns the Python daemon via Node's `child_process.spawn()` upon connection. WebContents IPC dynamically routes the JSON stream directly into a Zustand store that drives the UI, meaning the application faithfully updates only upon guaranteed hardware notification.

## How to Run

Running the entire full-stack application (Frontend + Backend) has been unified into a single command!

### Prerequisites & Setup
1. Ensure your Moto Buds are paired to your Linux machine via Classic Bluetooth (not LE).
2. Install the necessary Node modules for the Electron frontend:
   ```bash
   npm install
   ```
3. The Python backend scripts rely purely on standard libraries (`socket`, `struct`, `binascii`), so no external pip packages (`requirements.txt`) are necessary to run the desktop app.

### Start the Application

Simply run:

```bash
npm run dev
```

This will concurrently compile the TypeScript backend, spin up the Vite React server, and launch the Electron desktop window. From the beautiful skeuomorphic interface, you can seamlessly connect to your earbuds and control ANC, Game Mode, Volume Boost, and In-Ear Detection!

## Protocol Documentation

For a full, in-depth breakdown of the proprietary protocol, opcodes, and packet structure, please see the completely documented [PROTOCOL.md](PROTOCOL.md).

## Automated Testing

To ensure the SPP parser logic is robust and doesn't drop asynchronous packets (like Battery Notifications trailing behind Empty ACKs), we have a mock local test server that mimics the exact Moto Buds PDU flow.

You can run the full automated integration test without your earbuds being physically present:

```bash
source .venv/bin/activate
python backend/test_integration.py
```
