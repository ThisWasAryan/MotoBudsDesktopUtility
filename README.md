# Moto Buds Desktop Utility (Linux)

An open-source desktop utility for configuring and controlling Motorola Moto Buds on Linux. This project successfully reverse-engineers the proprietary Bluetooth communication protocol used by the official Android application and provides a beautiful, premium desktop UI.

## Hardware Verification (Moto Buds Base Model)

All current protocol reverse-engineering and feature implementations have been strictly tested and verified on the **Moto Buds (Base Model)**. 

The following functionalities are confirmed to be 100% working:
* **In-Ear Detection**: Accurately detects whether the earphones are physically inside the ear.
* **Battery Levels**: 
  * Granular battery reporting for individual earbuds (Left/Right).
  * Accurate Case battery reporting (even when only one earbud is inside the case).
* **Charging Status**: Granular tracking. If both earbuds are in the case, both show charging status. If one is full, it correctly reports as not charging.
* **Active Noise Cancellation (ANC)**: Verified working across all states.
* **Fit Test**: Accurately tests the seal quality and provides distinct, independent pass/fail results for the left and right earbuds.
* **Game Mode**: Verified working. Automatically handles mutual exclusivity with Hi-Res Audio via custom UI dialogs.
* **Volume Booster**: Verified working.
* **Custom 10-Band Equalizer**: A full implementation of the `0x0306` equalizer protocol. Uses a custom 173-byte payload to offer precise floating-point gain control across 10 frequency bands.
* **Hi-Res Audio (LDAC)**: Successfully implemented codec negotiation from the desktop client, entirely replicating the functionality that was previously restricted to the Android app. Handles mutual exclusivity with Game Mode.

*Note: Spatial Audio is partially supported and dynamically surfaces only when the connected device is a Moto Buds+.*

## How It Works: Step-by-Step

This application consists of two completely decoupled components: a lightweight Python background daemon that speaks natively to the earbuds, and a gorgeous React/Electron frontend that gives you control.

Here is exactly what happens under the hood when you use the app:

### 1. Opening the App & Clicking Connect
1. You run `npm run dev`, which compiles the frontend and launches the Electron window.
2. The app starts on the "Unconnected" screen.
3. When you click **Power On** (Connect), the React app sends an IPC (Inter-Process Communication) message to Electron's `main.ts` file.
4. `main.ts` uses Node's `child_process.spawn()` to silently boot up `backend/moto_control.py` in daemon mode.
5. The Python daemon opens a Classic Bluetooth RFCOMM socket (Port 16) directly to your earbuds and negotiates the initialization handshake. 
6. Upon success, the Python daemon prints `{"type": "status", "status": "connected"}` to its standard output.
7. Electron reads this output, forwards it to the React app, and the UI visually transitions to the Main Dashboard.
8. The React app immediately requests a full state synchronization (Battery, ANC, Hi-Res, etc.).

### 2. Performing an Action (e.g., Toggling ANC)
1. You click the "ANC" slider on the Main Dashboard.
2. The React UI **does not** optimistically change the slider position. Instead, it fires an IPC command: `window.api.motoCommand({ op: 'anc', mode: 1 })`.
3. Electron receives this command and pipes it into the `stdin` (Standard Input) of the running Python daemon.
4. The Python daemon reads the input, formats the proprietary Protocol Data Unit (PDU) packet for Opcode `513`, and writes it to the Bluetooth RFCOMM socket.
5. The earbuds receive the packet, physically enable Active Noise Cancellation, and immediately broadcast a confirmation PDU packet back to the host.
6. The Python daemon's asynchronous polling loop reads the raw hex response from the socket and prints it as a JSON event to `stdout`.
7. Electron captures the `stdout`, pipes it back to React, and the Zustand state manager (`useDeviceStore.ts`) parses the packet.
8. The Zustand state updates `ancMode` to `1`, which triggers React to re-render the Dashboard, finally sliding the UI toggle to the "ANC" position.

*This entire round-trip takes milliseconds. Because the UI only updates upon guaranteed hardware broadcast, the interface represents the absolute physical truth of the earbuds.*

## How to Run

Running the entire full-stack application (Frontend + Backend) has been unified into a single command!

### Prerequisites & Setup
1. Ensure your Moto Buds are paired and connected to your Linux machine via standard OS Bluetooth settings.
2. Install the necessary Node modules for the Electron frontend:
   ```bash
   npm install
   ```
3. The Python backend scripts rely purely on standard libraries (`socket`, `struct`, `binascii`), so no external pip packages are necessary.

### Start the Application

Simply run:

```bash
npm run dev
```

This will launch the Electron desktop window. From the beautiful skeuomorphic interface, you can seamlessly connect to your earbuds and control ANC, Game Mode, Volume Boost, Hi-Res Audio, and In-Ear Detection.

## Documentation

* **[PROTOCOL.md](PROTOCOL.md)**: A complete, in-depth breakdown of the proprietary reverse-engineered Bluetooth protocol, opcodes, and packet structures.
* **[INTERFACE.md](INTERFACE.md)**: Documentation on the decoupling between the React frontend and the Python backend, explaining the state management system for developers or AI agents wanting to completely redesign the UI.

## Automated Testing

To ensure the SPP parser logic is robust and doesn't drop asynchronous packets, we have a mock local test server that mimics the exact Moto Buds PDU flow. You can run the full automated integration test without your earbuds being physically present:

```bash
source .venv/bin/activate
python backend/test_integration.py
```
