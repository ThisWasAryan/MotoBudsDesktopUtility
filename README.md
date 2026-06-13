# Moto Buds Desktop Utility for Windows

An open-source, fully-featured desktop utility for configuring and controlling Motorola Moto Buds natively on Windows. This project successfully reverse-engineers the proprietary Bluetooth RFCOMM communication protocol used by the official Android application and implements a beautiful, premium skeuomorphic desktop user interface using React and Electron.

**This is the `dev-windows` branch**, specifically tailored and compiled as a standalone native Windows executable.

## System Tray Integration & Background Operation

MotoBudsDesktopUtility includes a seamless system tray integration that allows the application to continue running in the background after the main window is closed. This provides instant access to your earbuds without cluttering your taskbar.

### How to Pin the App to the Taskbar

By default, Windows hides new system tray icons inside the overflow menu (the small `^` arrow on your taskbar). To keep the Moto Buds icon always visible for quick access:
1. Right-click your Windows Taskbar and select **Taskbar settings**.
2. Expand the **Other system tray icons** section.
3. Find **MotoBudsDesktopUtility** in the list and toggle the switch to **On**.

### Tray Features

<table>
<tr>
<td align="center" valign="top" width="50%">
  <b>Battery Monitoring</b>
<img width="480" height="132" alt="TrayHoverCROPPED" src="https://github.com/user-attachments/assets/ad003afa-3a5f-4812-962c-e0f5988d0220" />
  Hover over the tray icon to instantly view earbud battery levels.
<img width="480" height="132" alt="TrayHover+BatCaseCROPPED" src="https://github.com/user-attachments/assets/272d2f41-4cf7-44d6-99db-642f2c918298" />
 When the earbuds are placed in the charging case, case battery information is automatically displayed as well.
</td>
<td align="center" valign="top" width="50%">
<img width="504" height="293" alt="TrayOPENCROPPED" src="https://github.com/user-attachments/assets/0194e664-6d4b-43a9-8cac-4238ae009035" />
<br><b>Quick Controls</b><br>
Access noise control modes, open the application, or quit directly from the tray menu.
</td>
</tr>
</table>

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

All protocol reverse-engineering, payload cryptography, and feature implementations have been strictly tested and verified on the **Moto Buds (Base Model)** on Windows 10/11 using native `AF_BTH` Winsock sockets.

The following functionalities are confirmed to be **100% working natively on Windows**:
* **Gestures Control (Advanced)**: Highly customizable tap settings (Double Tap, Triple Tap, Press & Hold) for each earbud independently. 
* **Custom 10-Band Equalizer (With Presets)**: A full implementation of the `0x0306` equalizer protocol. Uses a custom 173-byte payload to offer precise floating-point gain control across 10 frequency bands. You can seamlessly switch between pre-configured custom presets or dial in your own Custom EQ.
* **In-Ear Detection**: Accurately detects whether the earphones are physically inside the ear.
* **Fit Test (Improved Diagnostics)**: Accurately tests the seal quality and provides distinct, independent pass/fail results for the left and right earbuds using dedicated visual indicators.
* **Find My Device**: Individually ring your left or right misplaced earbuds with safety checks (prevents ringing if the earbud is physically detected inside your ear to prevent hearing damage).
* **Connection State Machine**: A seamless background state machine provides visual feedback while the earbuds are syncing.
* **Active Noise Cancellation (ANC)**: Verified working across all states (Off, Transparency, Active Noise Cancellation).
* **Game Mode**: Verified working via latency reduction opcodes. 
* **Volume Booster**: Verified working.
* **Battery & Charging Telemetry**: 
  * Granular battery reporting for individual earbuds (Left/Right).
  * Accurate Case battery reporting (even when only one earbud is inside the case).
  * Real-time charging tracking. 

*(Note: Hi-Res audio codec switching is a Linux-only feature and is safely disabled on the Windows client.)*

## Installation & Download

MotoBudsDesktopUtility provides pre-compiled binaries that include absolutely everything you need, bundling a local Python environment so you do not need to install Python or any dependencies on your system.

1. **Download the latest release**: Navigate to the [Releases](https://github.com/ThisWasAryan/MotoBudsDesktopUtility/releases) page.
2. **Choose your version**:
   - `MotoBudsDesktopUtility Setup X.X.X.exe` (Recommended: Full installation wizard that adds the app to your Start Menu and creates shortcuts).
   - `MotoBudsDesktopUtility X.X.X.exe` (Portable: Runs instantly without installation).
3. **Run the application**: Make sure your Moto Buds are connected to your Windows Bluetooth settings before clicking "Connect" in the app!

## Building from Source

If you wish to build the Windows application from source or contribute to the project:

### Prerequisites & Setup
1. Ensure you have Node.js installed.
2. Clone this repository and checkout the `dev-windows` branch:
   ```bash
   git clone https://github.com/ThisWasAryan/MotoBudsDesktopUtility.git
   cd MotoBudsDesktopUtility
   git checkout dev-windows
   ```
3. Install the necessary Node modules:
   ```bash
   npm install
   ```

### Start the Application (Development)
Simply run:
```bash
npm run dev
```

### Build Distributions
To compile the standalone Windows `.exe` binaries yourself using Electron Builder:
```bash
npm run dist:win
```
Your compiled binaries will be output to the `builds/` directory.
