# Moto Buds Desktop Utility (Linux)

An open-source desktop utility for configuring and controlling Motorola Moto Buds on Linux. This project successfully reverse-engineers the proprietary Bluetooth communication protocol used by the official Android application and provides a beautiful, premium desktop UI.

## Current Architecture

We have successfully reverse-engineered the communication transport layer and the strict Protocol Data Unit (PDU) framing.

1. **Python SPP Backend (`backend/moto_control.py`)**
   - We discovered that the Moto Buds **do not use GATT over BLE** for primary control. Instead, they use **Classic Bluetooth SPP (RFCOMM)** over Port 16.
   - The backend constructs perfectly framed byte packets (HEAD, length, Opcode, payload, Little-Endian CRC32) and executes the strict initialization handshake required by the earbuds.
   
2. **Electron / React Frontend**
   - A modern React application utilizing Vite, Electron IPC, and a mature, robust UI design. 
   - The UI securely bridges to the Node.js main process, which seamlessly executes the Python backend and parses the JSON output to display real-time status.

## How to Run

Running the entire full-stack application (Frontend + Backend) has been unified into a single command!

### Prerequisites
1. Ensure your Moto Buds are paired to your Linux machine via Classic Bluetooth (not LE).
2. Ensure you have installed the Node modules (`npm install`).
3. Ensure the Python virtual environment has its dependencies (if any).

### Start the Application

Simply run:

```bash
npm run dev
```

This will concurrently compile the TypeScript backend, spin up the Vite React server, and launch the Electron desktop window. From the beautiful glass panel interface, you can immediately click **Read Battery**, **Read Hardware Info**, or click the **Noise Control** toggles.

## Protocol Documentation

For a full, in-depth breakdown of the proprietary protocol, opcodes, and packet structure, please see the completely documented [PROTOCOL.md](PROTOCOL.md).

## Troubleshooting Physical ANC States

While the earbuds accept our perfectly framed ANC Write commands (`Opcode 0x0201`) and return a `Success` code, the physical ANC state sometimes does not toggle depending on the earbud variant.

If you want to debug the python scripts manually without the UI, you can run:

```bash
source .venv/bin/activate
python backend/moto_control.py --battery --json
python backend/moto_control.py --anc 1
```

We welcome contributions to help map the final physical toggle payloads for specific earbud models (like the Moto Buds Bass).
