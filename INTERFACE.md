# Moto Buds Desktop Utility: Interface Documentation

This document serves as a guide for AI agents and developers modifying the User Interface (UI) of the Moto Buds Desktop Utility. It outlines the core architectural principles, state management bindings, and the boundaries between the visual layer and the underlying Bluetooth Daemon.

## Core Principle: Complete Decoupling

The frontend UI is completely decoupled from the actual hardware execution. The UI is a purely reactive view layer. **You can drastically redesign, rewrite, or replace the entire UI without breaking the program's functionality, provided you adhere to the Zustand state bindings.**

### How the Flow Works
1. **User Action:** A user clicks a button in the UI (e.g., toggling ANC).
2. **IPC Command:** The UI calls `window.api.motoCommand({ op: 'anc', mode: 1 })`. 
   * **CRITICAL:** The UI does *not* optimistically update the state.
3. **Daemon Execution:** The Python daemon writes the payload to the Bluetooth RFCOMM socket.
4. **Hardware Response:** The earbuds execute the command and asynchronously broadcast a state-change packet back to the host.
5. **State Ingestion:** The Python daemon reads this packet and emits a JSON event to `stdout`.
6. **Store Update:** `App.tsx` intercepts this JSON, parses the packet, and updates the Zustand store (`useDeviceStore`).
7. **UI Reactivity:** The React components automatically re-render based on the new Zustand state.

## State Management (`useDeviceStore.ts`)

Any new or modified UI components must bind to the values exported by `useDeviceStore`.

### Available State Variables
* `connected` (boolean): Whether the Python daemon is actively attached.
* `reconnectStatus` (string: 'idle' | 'dropping' | 'reconnecting' | 'success'): The state machine for codec reconnection UI sequences.
* `name` & `modelId` (string): Hardware identifiers.
* `battery`: Object containing `left`, `right`, and `case` percentages (0-100), as well as charging booleans (`chargingL`, `chargingR`, `chargingCase`, `inCaseL`, `inCaseR`).
* `ancMode` (number): Active Noise Cancellation state (0 = Off, 1 = ANC, 2 = Transparency).
* `gameMode` (boolean): Low-latency gaming mode.
* `hiRes` (boolean): LDAC / LHDC Hi-Res audio toggle.
* `volBoost` (boolean): Artificial volume booster.
* `physicallyInEarL` & `physicallyInEarR` (boolean): In-Ear Detection hardware sensors.
* `fitTestRunning` (boolean): Whether the Fit Test audio sequence is currently actively playing.
* `fitTestResultL` & `fitTestResultR` (number | null): The result of the Fit Test for each earbud independently (1 = Good Fit).
* `eqBands` (number[]): An array of 10 floating-point numbers representing the gain for the custom equalizer (-3.0 to 3.0).
* `fmdLeft` & `fmdRight` (boolean): Find My Device active ringing status for the Left and Right earbuds.
* `inEarFeatureEnabled` (boolean): Whether the auto-pause in-ear detection feature is globally enabled.
* `gestures`: Object containing `left` and `right` mappings. Each maps gesture types (1 = Double Tap, 2 = Triple Tap, 3 = Press and Hold) to function IDs (0 = None, 1 = Play/Pause, 2 = Previous, 3 = Next, 4 = Voice Assistant, 10 = Noise Control).

### Available Action Functions
When binding click handlers in your UI components, use these exposed setters. Note that these setters internally trigger the IPC `window.api.motoCommand` calls; you do not need to call the IPC layer manually from the UI components.

*Note: Due to a hardware constraint, `hiRes` and `gameMode` cannot be active at the same time. The UI components (e.g., `SoundMenu.tsx`) must manage this mutual exclusivity by presenting a confirmation dialog before sequentially toggling the states using these action functions.*

* `setAncMode(mode: number, subMode: number)`
* `setEqBands(bands: number[])`
* `setGameMode(enabled: boolean)`
* `setVolBoost(enabled: boolean)`
* `setHiRes(enabled: boolean)`
* `setFmd(left: boolean, right: boolean)`
* `setInEarFeature(enabled: boolean)`
* `setGestureConfig(earbud: number, gestureType: number, func: number)`

## Component Structure

The current app utilizes a framer-motion powered single-page architecture:
* `App.tsx`: The root orchestrator. It manages the connection screen, IPC routing, and dynamically mounts sub-components based on `currentView`.
* `MainDashboard.tsx`: The primary hero screen featuring the device artwork, live battery pods, ANC sliders, and an in-ear status indicator (an `Ear` icon next to the left/right label). **Design Constraint:** The battery charging icon (`Zap`) must be placed in the card header mutually exclusively with the `Ear` icon, because an earbud cannot be charging in the case and physically in-ear simultaneously. Do not place the charging icon next to the battery percentage.
* `SoundMenu.tsx`: A sub-menu containing detailed toggles (Spatial Audio, Game Mode, Hi-Res, Volume Boost) and a navigation link to the custom Equalizer.
* `Equalizer.tsx`: The 10-band custom graphic equalizer UI. Features preset options (Flat, Bass Boost, Treble Boost, Classical, Electronic, Acoustic, Vocal) alongside a "Custom EQ" mode. When in Custom EQ mode, users can adjust individual frequency bands or use global Bass/Treble macro sliders that apply a scaled curve to the lower/upper frequencies.
* `MoreMenu.tsx`: A settings hub serving as the third main navigation tab. Contains the `In-Ear Detection` toggle, and navigation cards routing to `Fit Test` and `Find My Device`.
* `FindMyDevice.tsx`: A menu for locating misplaced earbuds. Contains logic to check `physicallyInEarL` and `physicallyInEarR` to display a warning modal before triggering the loud ring sound. It utilizes the `setFmd` action to start/stop the ringing individually.
* `Gestures.tsx`: A panel for customizing tap actions (Double Tap, Triple Tap, Press and Hold) for the left and right earbuds independently. Implements UI constraints to ensure Voice Assistant (4) and Noise Control (10) cannot be active on the same earbud simultaneously.

### Designing New Components
If you decide to rewrite the UI (e.g., switching from Skeuomorphism to Flat Material Design):
1. Create your component.
2. Import `useDeviceStore`.
3. Map the store's boolean/number states to your visual elements.
4. Bind the store's action functions to your `onClick` handlers.

You do not need to touch `main.ts`, `moto_control.py`, or the PDU parsing logic when redesigning the UI.
