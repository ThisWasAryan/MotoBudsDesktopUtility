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
* `name` & `modelId` (string): Hardware identifiers.
* `battery`: Object containing `left`, `right`, and `case` percentages (0-100), as well as charging booleans (`chargingL`, `chargingR`, `chargingCase`, `inCaseL`, `inCaseR`).
* `ancMode` (number): Active Noise Cancellation state (0 = Off, 1 = ANC, 2 = Transparency).
* `gameMode` (boolean): Low-latency gaming mode.
* `hiRes` (boolean): LDAC / LHDC Hi-Res audio toggle.
* `volBoost` (boolean): Artificial volume booster.
* `physicallyInEarL` & `physicallyInEarR` (boolean): In-Ear Detection hardware sensors.

### Available Action Functions
When binding click handlers in your UI components, use these exposed setters. Note that these setters internally trigger the IPC `window.api.motoCommand` calls; you do not need to call the IPC layer manually from the UI components.

* `setAncMode(mode: number, subMode: number)`
* `setGameMode(enabled: boolean)`
* `setVolBoost(enabled: boolean)`
* `setHiRes(enabled: boolean)`

## Component Structure

The current app utilizes a framer-motion powered single-page architecture:
* `App.tsx`: The root orchestrator. It manages the connection screen, IPC routing, and dynamically mounts sub-components based on `currentView`.
* `MainDashboard.tsx`: The primary hero screen featuring the device artwork, live battery pods, and ANC sliders.
* `SoundMenu.tsx`: A sub-menu containing detailed toggles (Spatial Audio, EQ, Game Mode).
* `Equalizer.tsx`: The 10-band custom graphic equalizer UI.

### Designing New Components
If you decide to rewrite the UI (e.g., switching from Skeuomorphism to Flat Material Design):
1. Create your component.
2. Import `useDeviceStore`.
3. Map the store's boolean/number states to your visual elements.
4. Bind the store's action functions to your `onClick` handlers.

You do not need to touch `main.ts`, `moto_control.py`, or the PDU parsing logic when redesigning the UI.
