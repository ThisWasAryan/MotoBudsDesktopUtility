# Moto Buds Desktop Utility for Linux

An open-source, fully-featured desktop utility for configuring and controlling Motorola Moto Buds on Linux. This project successfully reverse-engineers the proprietary Bluetooth RFCOMM communication protocol used by the official Android application and implements a beautiful, premium skeuomorphic desktop user interface using React and Electron.

**What's New in the Latest Overhaul:** We have completely rewritten the UI layout to feature a dual-pane aesthetic, vastly improved connection reliability through daemon-level adapter bouncing, and achieved complete 100% feature parity with the official Android application (excluding Adaptive ANC). **Every single feature has been rigorously tested and is confirmed to be fully working on native Linux!**

[A Demonstration/Tutorial Video For Previous Versions](https://youtu.be/mqCdtErJAHM) *last updated on 10/06/2026*
## Application Preview

<p align="center">
  <a href="https://github.com/user-attachments/assets/c91bd90a-ad84-4424-b291-0094ab8f8575">
    <img src="https://github.com/user-attachments/assets/c91bd90a-ad84-4424-b291-0094ab8f8575" width="1000" alt="MotoBudsController Overview">
  </a>
</p>

## Feature Gallery

<table>
<tr>
<td align="center">
<a href="https://github.com/user-attachments/assets/4641ca38-0e72-49fe-8482-e9030fc11150">
<img src="https://github.com/user-attachments/assets/4641ca38-0e72-49fe-8482-e9030fc11150" width="500" alt="Sound">
</a>
<br>
<b>Sound Control</b><br>
ANC, Transparency, and audio settings.
</td>

<td align="center">
<a href="https://github.com/user-attachments/assets/783bdad1-f3bb-4d96-a394-57e9f838a617">
<img src="https://github.com/user-attachments/assets/783bdad1-f3bb-4d96-a394-57e9f838a617" width="500" alt="Equalizer">
</a>
<br>
<b>Equalizer</b><br>
Fine tune your listening experience.
</td>
</tr>

<tr>
<td align="center">
<a href="https://github.com/user-attachments/assets/de3287be-f407-49ac-9bdf-9a762c485148">
<img src="https://github.com/user-attachments/assets/de3287be-f407-49ac-9bdf-9a762c485148" width="500" alt="Gestures">
</a>
<br>
<b>Gesture Configuration</b><br>
Customize earbud touch controls.
</td>

<td align="center">
<a href="https://github.com/user-attachments/assets/a5d800f5-2d7e-4e8b-b83f-4864ee51b0de">
<img src="https://github.com/user-attachments/assets/a5d800f5-2d7e-4e8b-b83f-4864ee51b0de" width="500" alt="Find My Device">
</a>
<br>
<b>Find My Device</b><br>
Locate misplaced earbuds.
</td>
</tr>

<tr>
<td align="center">
<a href="https://github.com/user-attachments/assets/2e892da0-3b1f-4a66-897f-6e4e0611e448">
<img src="https://github.com/user-attachments/assets/2e892da0-3b1f-4a66-897f-6e4e0611e448" width="500" alt="Fit Test">
</a>
<br>
<b>Ear Tip Fit Test</b><br>
Verify fit and seal quality.
</td>

<td align="center">
<a href="https://github.com/user-attachments/assets/9536afb7-6fbf-4a41-ace9-febcbf599023">
<img src="https://github.com/user-attachments/assets/9536afb7-6fbf-4a41-ace9-febcbf599023" width="500" alt="More">
</a>
<br>
<b>Additional Settings</b><br>
Advanced options and device information.
</td>
</tr>
</table>

## Hardware Verification (Moto Buds Base Model)

All current protocol reverse-engineering, payload cryptography, and feature implementations have been strictly tested and verified on the **Moto Buds (Base Model)**. 

The following functionalities are confirmed to be **100% working**:
* **Gestures Control (Advanced)**: Highly customizable tap settings (Double Tap, Triple Tap, Press & Hold) for each earbud independently. This desktop app securely injects opcode `0x0100` and offers *more granular customization* than the official Motorola mobile app. We have implemented native AVRCP bridging via `mpris-proxy`, ensuring your taps accurately pause, play, and skip media globally across your Linux desktop.
* **Trust Protocol Integration**: We have implemented a native D-Bus command sequence that makes the Linux host device automatically trust the earbuds. This ensures that tap gestures and in-ear detection function flawlessly without manual Bluetooth pairing intervention or trust command-line hacking.
* **Custom 10-Band Equalizer (With Presets)**: A full implementation of the `0x0306` equalizer protocol. Uses a custom 173-byte payload to offer precise floating-point gain control across 10 frequency bands. You can seamlessly switch between pre-configured custom presets (Flat, Bass Boost, Treble Boost, etc.) or dial in your own Custom EQ.
* **Hi-Res Audio (LDAC) Negotiation**: Successfully implemented codec negotiation directly from the desktop client, entirely replicating the functionality that was previously restricted to the Android app. Our backend gracefully survives the deliberate Bluetooth protocol disconnect triggered by the earbuds, and forcefully re-routes the Linux PipeWire A2DP stack to accept the new LDAC sample rates. Handles mutual exclusivity with Game Mode out of the box.
* **In-Ear Detection**: Accurately detects whether the earphones are physically inside the ear and seamlessly auto-pauses/resumes system media.
* **Fit Test (Improved Diagnostics)**: Accurately tests the seal quality and provides distinct, independent pass/fail results for the left and right earbuds using dedicated visual indicators. It utilizes a state machine to track the `1024` and `1025` response codes from the earbuds during the diagnostic sweep.
* **Find My Device**: Individually ring your left or right misplaced earbuds with safety checks (prevents ringing if the earbud is physically detected inside your ear to prevent hearing damage).
* **Connection State Machine**: A seamless background state machine provides visual feedback (loading spinners, connection checks, dropped statuses) while the earbuds momentarily disconnect to renegotiate codecs or drop connections. The UI instantly reflects the daemon's internal RFCOMM socket state.
* **Active Noise Cancellation (ANC)**: Verified working across all states (Off, Transparency, Active Noise Cancellation).
* **Game Mode**: Verified working via latency reduction opcodes. Automatically handles mutual exclusivity with Hi-Res Audio via custom UI dialogs.
* **Volume Booster**: Verified working.
* **Battery & Charging Telemetry**: 
  * Granular battery reporting for individual earbuds (Left/Right).
  * Accurate Case battery reporting (even when only one earbud is inside the case).
  * Real-time charging tracking. Earbuds show a charging indicator when placed inside the case, and the case accurately reports its own charging status when plugged in.

*Note: Spatial Audio is partially supported and dynamically surfaces only when the connected device is a Moto Buds+.*


## Packaging & Installation

We strictly maintain our repository to only contain raw source code. All runtime dependencies, including the Python daemon components and Bluetooth bridging utilities, are automatically resolved during packaging.

Pre-packaged standalone binaries for **Debian-based systems** (`.deb`) and **other Linux distributions** (`.AppImage`) are available in the **Releases** section of this repository. The `.deb` package specifically declares dependencies on `python3` and `bluez` to ensure `mpris-proxy` is available on your system for media gestures.

> **⚠️ Connection Warning:** Please ensure your earbuds are natively connected to your OS via your Bluetooth manager **before** pressing the "Connect" button on the first screen. If you connect them *after* reaching the connection screen, you may experience slight connectivity issues. If this happens, simply disconnect and reconnect the earbuds from your OS Bluetooth manager.

> **🖥️ Windows Status:** We are actively investigating a Windows release. However, the current backend relies heavily on the Linux BlueZ Bluetooth stack. A Windows port requires a significantly different architecture and will take some time.

## Architecture: How It Works

This application consists of two completely decoupled components: a lightweight Python background daemon that speaks natively to the earbuds over RFCOMM, and a gorgeous React/Electron frontend that gives you visual control.

Here is exactly what happens under the hood when you use the app:

### 1. Daemon Initialization & State Synchronization
1. You launch the application.
2. The app starts on the "Unconnected" screen.
3. When you click **Connect**, the React app sends an IPC (Inter-Process Communication) message to Electron's main process.
4. Electron uses Node's `child_process.spawn()` to silently boot up `backend/moto_control.py` in daemon mode.
5. The Python daemon opens a Classic Bluetooth RFCOMM socket (Port 16) directly to your earbuds and negotiates the initialization handshake. 
6. Upon establishing a successful connection, the Python daemon fires up `mpris-proxy` in the background to handle AVRCP gesture bridging, and prints `{"type": "status", "status": "connected"}` to its standard output.
7. Electron reads this output, forwards it to the React app, and the UI visually transitions to the Main Dashboard.
8. The React app immediately requests a full state synchronization by injecting a `sync` opcode sequence into the daemon, fetching Battery, ANC, Gestures, and Hi-Res states.

### 2. Event-Driven IPC Command Execution
1. You click a control, such as the "ANC" toggle, on the Main Dashboard.
2. The React UI **does not** optimistically change the slider position. Instead, it fires an IPC command: `window.api.motoCommand({ op: 'anc', mode: 1 })`. *(Note: The sole exception to this rule is the In-Ear Detection toggle, which is optimistically updated locally because the earbuds' firmware does not emit an asynchronous confirmation packet for opcode `1027`.)*
3. Electron receives this command and pipes it into the `stdin` (Standard Input) of the running Python daemon.
4. The Python daemon reads the input, formats the proprietary Protocol Data Unit (PDU) packet, appends a dynamically calculated CRC32 checksum, and writes it to the Bluetooth RFCOMM socket.
5. The earbuds receive the packet, physically enable Active Noise Cancellation, and immediately broadcast a confirmation PDU packet back to the host.
6. The Python daemon's asynchronous polling loop reads the raw hex response from the socket and prints it as a JSON event to `stdout`.
7. Electron captures the `stdout`, pipes it back to React, and the Zustand state manager (`useDeviceStore.ts`) parses the packet.
8. The Zustand state updates `ancMode` to `1`, which triggers React to re-render the Dashboard, finally updating the ANC segment in the UI.

*This entire round-trip takes milliseconds. Because the UI only updates upon guaranteed hardware broadcast, the interface represents the absolute physical truth of the earbuds.*

## Documentation

* **[PROTOCOL.md](PROTOCOL.md)**: A complete, in-depth breakdown of the proprietary reverse-engineered Bluetooth protocol, opcodes, CRC32 algorithms, and payload structures.
* **[INTERFACE.md](INTERFACE.md)**: Documentation on the decoupling between the React frontend and the Python backend, explaining the state management system for developers or AI agents wanting to completely redesign the UI.

## Development & Building

If you wish to build the application from source or contribute to the project:

### Prerequisites & Setup
1. Ensure your Moto Buds are paired and connected to your Linux machine via standard OS Bluetooth settings.
2. Install the necessary Node modules for the Electron frontend:
   ```bash
   npm install
   ```
3. The Python backend scripts rely purely on standard libraries (`socket`, `struct`, `binascii`, `subprocess`, `json`), so no external `pip` packages are necessary.

### Start the Application
Simply run:
```bash
npm run dev
```

### Build Distributions
To compile the standalone binaries yourself:
```bash
npm run dist:linux
```

## Automated Testing

To ensure the SPP parser logic is robust and doesn't drop asynchronous packets, we have a mock local test server that mimics the exact Moto Buds PDU flow. You can run the full automated integration test without your earbuds being physically present:

```bash
source .venv/bin/activate
python backend/test_integration.py
```
