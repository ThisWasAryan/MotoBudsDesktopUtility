# Moto Buds Communication Protocol

## Project Overview

**Project Goals:** To completely reverse engineer the proprietary Motorola Moto Buds Android application communication protocol, recovering the full mechanism used to interact with the earbuds.
**Supported Devices:** Moto Buds, Moto Buds+, Moto Buds Bass, Moto Buds Loop, Moto Buds Clip, Moto Buds 2, Moto Buds 2 Plus.
**Scope:** Device identification, feature gating, Bluetooth LE/RFCOMM transport, packet framing, opcode registry, and feature-specific workflows (ANC, EQ, Gestures, Fit Test, Hi-Res, Game Mode).
**Current Status:** Protocol framing, opcode registry, custom EQ payloads, and feature workflows have been fully mapped and verified from the decompiled Android source code.

## Device Family Analysis

The application supports multiple variants of Moto Buds. There is **no dynamic protocol capability negotiation** between the earbuds and the application. Instead, all features are gated client-side using a bundled `buds_features.json` configuration file.

### Identification Method
The connected earbuds supply a `model_id` (e.g., `XT2441-1`) inside Opcode 0 (`0x0000` - get profile version / Firmware Info) at index 0 of the string payload. Alternatively, the app extracts the `model_id` mathematically from the Bluetooth GATT Service UUIDs (e.g., `18290100...` parses to `XT2441-1`). This `model_id` is queried against `buds_features.json` to look up supported feature IDs. 

### Device Variants

* **Moto Buds (XT2443-1 / guitar)**
  * **Capabilities:** Standard features. No Spatial Audio or Head Tracking.
  * **Features:** ANC (104), Hi-Res Audio (109), Game Mode (110), Bass Enhancement (112), Volume Boost (113), CrystalTalk (114), In-Ear Detection (116), Fit Test (117), FMD (121).

* **Moto Buds Bass (XT2443-1 / guitar25)**
  * **Capabilities:** Physically differentiated variant (UUIDs `182b0104` to `182b0106`), but maps to the identical feature set as standard Moto Buds in `buds_features.json`.

* **Moto Buds+ (XT2441-1 / flute)**
  * **Capabilities:** Premium model with Bose audio features.
  * **Features:** Same as Moto Buds, plus Spatial Audio (106).
  * **Note:** The UI enables Spatial Audio configuration exclusively for this model.

### Protocol Differences
There are **zero** protocol differences between variants. All models utilize a universal protocol and share the identical opcode registry. Features are gated purely on the client side; if a device lacks a feature flag, the application hides the corresponding UI and never dispatches the command.

## Architecture

* **BudsDetailedInfoViewModel:** The primary high-level orchestrator and state-holder for the UI. It handles hardware data and feature toggles.
* **C0274U (Service Manager):** Routes high-level calls and UI requests down to the low-level transport proxy. Entry points include `m709B(int opcode, int value, String address)` and `m710C`.
* **C4430d (Command Dispatcher):** Handles Bluetooth binding, service execution, and routing of PDUs through `m7994v(int, int)`.
* **C4562a (PDU Parser / Framaer):** Central utility for building, framing, checking CRC, and parsing incoming/outgoing PDUs.
* **BudsFeatureManager (C2266c):** Responsible for parsing `buds_features.json` and exposing Boolean flags to enable or disable features based on `model_id`.

## Bluetooth Layer
* **Transport:** Both BLE and Classic Bluetooth RFCOMM are supported. 
* **Routing:** `C4430d` negotiates the active connection. Wait for connection intent, bind service, and manage the I/O streams. The application uses a standard custom profile UUID `192d0100-4899-11ee-be56-0242ac120002` (and similar variants like `18290100...`) to connect and identify models.

## Packet Layer
All communication is structured into structured Protocol Data Units (PDUs) encapsulated with headers, footers, lengths, and checksums.

* **Framing (Classic Bluetooth SPP / RFCOMM):**
  * **HEAD:** `0x48 0x45 0x41 0x44` ("HEAD" in ASCII)
  * **Total Length:** 2 Bytes (Little-Endian). Value is always `8 + length(Payload)`.
  * **Opcode:** 2 Bytes (Big-Endian).
  * **Type:** 1 Byte (e.g., `0x80` = 128 for Request with Ack, `0x20` = 32 for Response Ack).
  * **Result:** 1 Byte (e.g., `0x00` = Success).
  * **Payload Length:** 2 Bytes (Little-Endian).
  * **Seq (Sequence Number):** 2 Bytes (Little-Endian).
  * **Payload:** N Bytes.
  * **CRC32:** 4 Bytes (Little-Endian). The checksum is computed over all preceding bytes, starting from the first byte of `HEAD` up to the last byte of the `Payload`.
  * **TAIL:** `0x54 0x41 0x49 0x4C` ("TAIL" in ASCII)
  
* **Framing (BLE GATT):**
  * The BLE GATT characteristics (`fc9d0002` for write, `fc9d0003` for notify) DO NOT use the full SPP framing to save MTU space.
  * They omit `HEAD`, `Total Length`, `CRC32`, and `TAIL`.
  * They send ONLY the 8-byte core header + payload: `[Opcode(2), Type(1), Result(1), PayloadLength(2), Seq(2), Payload(N)]`.

* **Connection Negotiation:**
  * Moto Control connects to a specific RFCOMM port associated with the custom UUID `fc9d9fe0-4899-11ee-be56-0242ac120002`. This is usually **Port 16**.
  * The standard `SPP_MOBILE` or Fast Pair `17` ports do not accept the full framed protocol.

## Opcode Registry

* `0x0000` (0): Get Profile Version / Firmware Info (Payload provides model_id, firmware/hardware versions, serials).
* `0x0001` (1): Get Support Features
* `0x0003` (3): Get Device Name
* `0x0004` (4): Get Hardware Info
* `0x0005` (5): Get Battery Level
* `0x0007` (7): Set Device Name (UTF-8 String Payload)
* `0x0009` (9): Battery Level Changed (Notification)
* `0x000B` (11): List Support Info and Configs
* `0x0010` (16): Read Account Key
* `0x0100` (256): Get Toggle Configs (Gestures)
* `0x0101` (257): Get Specific Toggle Config
* `0x0102` (258): Set Toggle Config (Gestures)
* `0x0105` (261): Toggle Config Status Changed (Notification)
* `0x0200` (512): Read ANC Mode
* `0x0201` (513): Set ANC Mode
* `0x0204` (516): ANC Mode Changed (Notification)
* `0x0300` (768): Read EQ State
* `0x0301` (769): Enumerate EQ Presets
* `0x0305` (773): Read Custom EQ
* `0x0306` (774): Write Custom EQ (173-byte payload)
* `0x030B` (779): Set Spatial Audio State
* `0x030C` (780): Read Hi-Res Mode
* `0x030D` (781): Set Hi-Res Mode
* `0x030E` (782): Read Game Mode
* `0x030F` (783): Set Game Mode
* `0x0311` (785): Hi-Res Mode State Changed (Notification)
* `0x0312` (786): Game Mode State Changed (Notification)
* `0x0400` (1024): Set Fit State (Fit Test start/stop)
* `0x0401` (1025): Fit Status Changed (Fit Test Result)
* `0x0402` (1026): Read In-Ear Detection State
* `0x0403` (1027): Set In-Ear Detection State
* `0x0404` (1028): In-Ear Status Changed (Notification)
* `0x0405` (1029): Set FMD State (Find My Device)
* `0x040C` (1036): In-Case Status Indication

## Feature Documentation

### Active Noise Cancellation (ANC)
* **Supported Devices:** All (Feature ID 104)
* **Read:** Opcode 512 | **Write:** Opcode 513
* **Payload:** 2 Bytes `[mode, sub_mode]`.
  * `mode = 0x00`: Off
  * `mode = 0x01`: ANC (`sub_mode` can be `0x01`, `0x02`, `0x03` for varying strengths).
  * `mode = 0x02`: Transparency (`sub_mode = 0x00` Default, `0x04` Voice Focus).

### Custom Equalizer
* **Supported Devices:** All
* **Read:** Opcode 773 | **Write:** Opcode 774
* **Payload:** Exactly 173 bytes long (Little-Endian).
  * `Byte 0`: `0x3F` (63) - Header
  * `Bytes 1-4`: Pre-amp gain (Float32 LE)
  * `Bytes 5-8`: Post-amp gain (Float32 LE)
  * `Bytes 9-12`: Number of bands (Int32 LE, value `10`)
  * `Bytes 13-172`: 10 bands of 16 bytes each. Each band includes Filter Type (Int32, `0`), Gain (Float32, `-3.0` to `3.0`), Frequency (Float32), and Q Factor (Float32, `0.75`).

### Hi-Res Audio (LDAC)
* **Supported Devices:** Feature ID 109
* **Read:** Opcode 780 | **Write:** Opcode 781
* **Payload:** 1 Byte (`[0x00]` Disable, `[0x01]` Enable).
* **State Machine:** Issuing this command causes the earbuds to intentionally drop the Bluetooth connection to reset and negotiate the LDAC codec. The app displays a "Reconnecting" spinner and waits for the OS connection broadcast.

### Game Mode
* **Supported Devices:** Feature ID 110
* **Read:** Opcode 782 | **Write:** Opcode 783
* **Payload:** 1 Byte (`[0x00]` Disable, `[0x01]` Enable). Game mode applies instantly without a connection reset.

### Fit Test
* **Supported Devices:** Feature ID 117
* **Start:** Opcode 1024 (Payload `[0x01]`). **Stop:** Opcode 1024 (Payload `[0x00]`).
* **Workflow:** The app sends the Start command. It monitors Opcode 1028 (In-Ear Status) to ensure earbuds remain seated. The earbuds calculate seal quality and asynchronously push the result via Opcode 1025.
* **Results Payload:** The view model parses it to: `0` (Left Fail), `1` (Right Fail), `2` (Both Pass), `3` (Both Fail).

### Gesture Configuration
* **Supported Devices:** Varies by variant configuration.
* **Read:** Opcode 256 / 257 | **Write:** Opcode 258
* **Payload:** 3 Bytes `[Earbud_Index, Gesture_Type_Index, Assigned_Function_Index]`. Left vs Right, Tap vs Long Press, Play/Pause vs Next Track.

## Reverse Engineering Notes
* **Important Discoveries:** The realization that `buds_features.json` is the sole source of truth for device capability discovery completely simplified the assumption that dynamic firmware negotiation was used. UUID parsing handles device matching locally. 
* **Rejected Hypotheses:** Initially hypothesized that Opcode 1/2 feature bitmaps dynamically controlled the UI. Proved false after analyzing `BudsFeatureManager` (C2266c). Also hypothesized a specific "reboot" opcode for Hi-Res audio, but discovered the earbuds handle the Bluetooth drop automatically upon receiving the codec change flag.

## Confidence Levels
* **Packet Framing & CRCs:** CONFIRMED.
* **Feature Gating / buds_features.json:** CONFIRMED. Identical cross-referencing to UI ViewModels.
* **Custom EQ Serialization (173-byte layout):** CONFIRMED. Reversed natively from Little-Endian Java ByteBuffer interactions.
* **ANC Modes:** CONFIRMED. Sub-mode bytes explicitly checked against blocker constraints.
* **LDAC Reconnection Workflow:** CONFIRMED.

## Open Questions
* **Firmware Updates:** The exact layout of the OTA binary transfer chunk payloads via RFCOMM is not fully mapped for `FirmwareUpgradeData`.
* **Multipoint Dual Connection (Feature 120):** How MAC addresses for a second connected device are routed or displayed natively.
