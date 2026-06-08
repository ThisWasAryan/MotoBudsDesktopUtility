import { BrowserWindow, ipcMain } from 'electron';
import { createBluetooth } from 'node-ble';
import { parsePDU, buildPDU } from './protocol';
import fs from 'fs';
import path from 'path';

let windowRef: BrowserWindow | null = null;
let featuresConfig: any = null;

let bluetoothInstance: ReturnType<typeof createBluetooth> | null = null;
let connectedDevice: any = null;
let writeCharacteristic: any = null;
let notifyCharacteristic: any = null;

// Sequence counters
let sequenceCounters: Record<number, number> = {};

function getSequence(opcode: number) {
  if (!sequenceCounters[opcode]) sequenceCounters[opcode] = 0;
  return sequenceCounters[opcode]++;
}

export async function setupBluetoothManager(win: BrowserWindow) {
  windowRef = win;

  // Load features config
  try {
    const configPath = path.join(process.env.APP_ROOT as string, 'assets', 'buds_features.json');
    if (fs.existsSync(configPath)) {
      featuresConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    console.error("Failed to load buds_features.json", e);
  }

  ipcMain.on('send-opcode', async (_event, { opcode, payload }) => {
    if (writeCharacteristic) {
      const seq = getSequence(opcode);
      const buffer = buildPDU(opcode, 128, seq, payload);
      try {
        await writeCharacteristic.writeValue(buffer);
      } catch (e) {
        console.error("Failed to write opcode", opcode, e);
      }
    }
  });

  ipcMain.on('trigger-scan', async () => {
    await scanAndConnect();
  });

  // Attempt auto connect
  scanAndConnect();
}

async function scanAndConnect() {
  if (!bluetoothInstance) {
    bluetoothInstance = createBluetooth();
  }
  
  const { bluetooth } = bluetoothInstance;

  try {
    const adapter = await bluetooth.defaultAdapter();
    
    console.log("Starting BLE discovery to find LE endpoints...");
    if (!await adapter.isDiscovering()) {
      await adapter.startDiscovery().catch((e: any) => console.log("Discovery already started or failed", e));
    }
    
    // Give it 3 seconds to find advertising BLE devices
    await new Promise(r => setTimeout(r, 3000));

    const devices = await adapter.devices();
    console.log(`Adapter knows about ${devices.length} devices.`);
    
    let connected = false;

    for (const mac of devices) {
      try {
        const dev = await adapter.getDevice(mac);
        const name = await dev.getName().catch(() => '');
        
        if (name.toLowerCase().includes('moto')) {
          console.log(`Found candidate: ${name} (${mac})`);
          
          const isConnected = await dev.isConnected();
          console.log(`- Is connected via OS: ${isConnected}`);
          
          if (!isConnected) {
            console.log(`- Attempting to connect...`);
            await dev.connect().catch((e: any) => console.log(`  Connection failed:`, e.message));
          }

          if (await dev.isConnected()) {
            console.log(`- Requesting GATT (with 3s timeout)...`);
            
            // node-ble device.gatt() hangs indefinitely if ServicesResolved never becomes true.
            // This happens when BlueZ connects via Classic Bluetooth but the device doesn't expose GATT over SDP.
            const gatt = await Promise.race([
              dev.gatt(),
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error('GATT resolution timeout')), 3000))
            ]);
            
            console.log(`- Requesting Services...`);
            const services = await gatt.services();
            console.log(`- Discovered Services:`, services);
            
            const mainServiceUuid = services.find((s: string) => s.includes('9fe0') || s.includes('fc9d'));
            
            if (mainServiceUuid) {
              console.log(`- Found Moto Buds service: ${mainServiceUuid}`);
              
              const service = await gatt.getPrimaryService(mainServiceUuid);
              const characteristics = await service.characteristics();
              console.log(`- Discovered characteristics:`, characteristics);
              
              let writeUuid = characteristics.find((c: string) => c.includes('ff0') || c.includes('ff2')) || characteristics[0];
              let notifyUuid = characteristics.find((c: string) => c.includes('ff1') || c.includes('ff3')) || characteristics[1];
              
              if (writeUuid) writeCharacteristic = await service.getCharacteristic(writeUuid);
              if (notifyUuid) notifyCharacteristic = await service.getCharacteristic(notifyUuid);

              if (notifyCharacteristic) {
                console.log(`- Starting notifications...`);
                await notifyCharacteristic.startNotifications();
                notifyCharacteristic.on('valuechanged', (buffer: Buffer) => {
                  const pdu = parsePDU(buffer);
                  if (pdu && windowRef) {
                    windowRef.webContents.send('state-update', pdu);
                  }
                });
              }

              // Parse modelId out of GATT service if possible, or fallback
              const uuidStr = mainServiceUuid.substring(0, 8);
              let modelId = `XT${parseInt(uuidStr.substring(0,2), 16)}${parseInt(uuidStr.substring(2,4), 16)}-${parseInt(uuidStr.substring(4,6), 16)}`;
              if (isNaN(parseInt(uuidStr.substring(0,2), 16))) {
                modelId = 'XT2441-1'; // fallback
              }

              let deviceFeatureData = featuresConfig?.devices?.find((d: any) => d.model_id === modelId) || featuresConfig?.devices?.[0];

              console.log(`- Sending device-connected to frontend for model ${modelId}...`);
              windowRef?.webContents.send('device-connected', {
                name,
                modelId: deviceFeatureData?.model_id || 'XT2443-1',
                features: deviceFeatureData?.feature_list || [104, 109, 110, 116, 117], 
                battery: { left: 100, right: 100, case: 100, charging: false } 
              });

              if (writeCharacteristic) {
                console.log(`- Syncing initial state...`);
                const reqAnc = buildPDU(512, 128, getSequence(512), []);
                const reqBat = buildPDU(5, 128, getSequence(5), []);
                await writeCharacteristic.writeValue(reqAnc).catch((e: any)=>console.error("  Failed to write ANC req", e));
                await writeCharacteristic.writeValue(reqBat).catch((e: any)=>console.error("  Failed to write BAT req", e));
              }

              connectedDevice = dev;
              connected = true;
              break; // Stop searching!
            } else {
              console.log(`- Moto Buds GATT service not found on ${mac}.`);
            }
          }
        }
      } catch (e: any) {
        console.log(`- Skipping ${mac} due to error: ${e.message}`);
      }
    }

    if (!connected) {
      console.log("Failed to connect to any valid Moto Buds GATT server.");
    }
    
  } catch (err) {
    console.error("Fatal error connecting to Moto Buds:", err);
  }
}
