# V5 Implementation Plan

## Goal Description
Fix the battery parsing, Fit Test asynchronous result, Find My Device (FMD) connection termination, Hi-Res reporting, in-ear detection state mapping, and dummy UI elements based on user feedback.

## User Review Required
No major breaking changes, but the Python backend interaction will be updated to handle long-running commands (for Fit Test and FMD).

## Proposed Changes

### 1. Battery Logic & Polling (App.tsx & useDeviceStore.ts)
- **Polling:** Decrease the `setInterval` battery polling from 15s to 3s in `App.tsx` for snappier updates.
- **In-Case Logic:** Update `useDeviceStore.ts` so `inCaseL` and `inCaseR` strictly rely on the charging bit or valid battery levels, removing the `rawCase` dependency that caused ghosting when one earbud was removed.

### 2. In-Ear Detection Logic
- **State Split:** Separate the physical state (`physicallyInEarL`, `physicallyInEarR`) from the feature toggle (`inEarFeatureEnabled`).
- **UI Dependency:** The Noise Control and Fit Test will check `physicallyInEar`, while the "More" menu toggle will control `inEarFeatureEnabled`.

### 3. Fit Test & FMD Disconnection Issue (backend/moto_control.py)
- **The Issue:** The SPP socket disconnects immediately after the Python script finishes sending the command. For FMD, this cancels the ring. For Fit Test, this misses the asynchronous result (Opcode 1025).
- **The Fix:** Add an optional `--keepalive <seconds>` argument to `moto_control.py`.
  - For **Fit Test**, we will keep the connection alive for 10 seconds and actively listen for Opcode 1025, then return the parsed result to Electron.
  - For **FMD**, we will keep the connection alive for the duration of the ringing (e.g., 15-30 seconds), allowing the volume to gradually build up.

### 4. Hi-Res & State Initialization
- **Startup Sync:** Add a `--sync` flag to `moto_control.py` that sequentially requests the current states of ANC, Hi-Res, Game Mode, and In-Ear detection on startup so the UI accurately reflects the real configuration, instead of assuming false/true arbitrarily.

### 5. Moto Buds+ Specific Features
- Hide the "Spatial Audio" and "Firmware Update" dummy options unless `modelId` matches `XT2441-1` (Moto Buds+).

## Verification Plan
1. Ensure the UI dynamically hides the case battery when one earbud is removed.
2. Ensure FMD keeps ringing because the socket stays open.
3. Ensure Fit Test successfully resolves to a checkmark or X.
4. Ensure the UI accurately reflects Hi-Res and ANC upon initial connection.
