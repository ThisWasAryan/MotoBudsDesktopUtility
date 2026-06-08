import { create } from 'zustand';

export interface DeviceState {
  connected: boolean;
  modelId: string | null;
  name: string | null;
  features: number[];
  battery: {
    left: number | null;
    right: number | null;
    case: number | null;
    chargingL: boolean;
    chargingR: boolean;
    chargingCase: boolean;
    inCaseL: boolean;
    inCaseR: boolean;
  };
  ancMode: number;
  ancSubMode: number;
  eqState: boolean;
  hiRes: boolean;
  gameMode: boolean;
  inEarFeatureEnabled: boolean;
  physicallyInEarL: boolean;
  physicallyInEarR: boolean;
  volBoost: boolean;
  fitTestRunning: boolean;
  fitTestResult: number | null;
  currentView: 'main' | 'sound' | 'gestures' | 'more' | 'fit-test' | 'ring-earbuds';
  
  // Actions
  setDevice: (data: any) => void;
  disconnect: () => void;
  updateStateFromPdu: (pdu: any) => void;
  setAncMode: (mode: number, subMode: number) => void;
  setEqState: (enabled: boolean) => void;
  setGameMode: (enabled: boolean) => void;
  setHiRes: (enabled: boolean) => void;
  setInEarFeature: (enabled: boolean) => void;
  setVolBoost: (enabled: boolean) => void;
  setCurrentView: (view: 'main' | 'sound' | 'gestures' | 'more' | 'fit-test' | 'ring-earbuds') => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  connected: false,
  modelId: null,
  name: null,
  features: [],
  battery: { left: null, right: null, case: null, chargingL: false, chargingR: false, chargingCase: false, inCaseL: false, inCaseR: false },
  ancMode: 0,
  ancSubMode: 0,
  eqState: false,
  hiRes: false,
  gameMode: false,
  inEarFeatureEnabled: false,
  physicallyInEarL: false,
  physicallyInEarR: false,
  volBoost: false,
  fitTestRunning: false,
  fitTestResult: null,
  currentView: 'main',

  setCurrentView: (view) => set({ currentView: view }),

  setDevice: (data) => set({
    connected: true,
    modelId: data.modelId,
    name: data.name,
    features: data.features,
    battery: data.battery
  }),

  disconnect: () => set({
    connected: false,
    modelId: null,
    name: null,
    features: [],
  }),

  updateStateFromPdu: (pdu) => set(() => {
    switch (pdu.opcode) {
      case 0: // Profile Version / Firmware Info
        try {
          const str = new TextDecoder().decode(new Uint8Array(pdu.payload));
          // Strings are likely null-terminated or delimited. Let's just find the first XT... string.
          const match = str.match(/(XT\d{4}-\d)/);
          
          let nameStr = "Moto Buds";
          if (str.toLowerCase().includes("moto buds bass")) nameStr = "Moto Buds Bass";
          else if (str.toLowerCase().includes("moto buds+")) nameStr = "Moto Buds+";
          
          if (match) {
            return { modelId: match[1], name: nameStr };
          } else if (nameStr !== "Moto Buds") {
            return { name: nameStr };
          }
        } catch (e) {}
        break;
      case 5: // Battery
      case 9: // Battery notification
      case 11: // Async Battery Notification (from diagnostics)
        if (pdu.payload.length >= 3) {
          let rawLeft, rawRight, rawCase;
          
          if (pdu.payload.length >= 9) {
             // Opcode 11 has a 9+ byte payload. Values are at indices 6, 7, 8
             rawLeft = pdu.payload[6];
             rawRight = pdu.payload[7];
             rawCase = pdu.payload[8];
          } else {
             // Standard Opcode 5 query has 3 byte payload
             rawLeft = pdu.payload[0];
             rawRight = pdu.payload[1];
             rawCase = pdu.payload[2];
          }
          
          return {
            battery: {
              left: (rawLeft & 0x7F) > 100 ? null : (rawLeft & 0x7F),
              right: (rawRight & 0x7F) > 100 ? null : (rawRight & 0x7F),
              case: (rawCase & 0x7F) > 100 ? null : (rawCase & 0x7F),
              chargingL: (rawLeft & 0x80) > 0,
              chargingR: (rawRight & 0x80) > 0,
              chargingCase: (rawCase & 0x80) > 0,
              inCaseL: rawCase !== 255,
              inCaseR: rawCase !== 255,
            }
          };
        }
        break;
      case 512: // Read ANC mode
      case 516: // ANC changed notification
        if (pdu.payload.length >= 2) {
          return { ancMode: pdu.payload[0], ancSubMode: pdu.payload[1] };
        }
        break;
      case 780:
      case 785:
        if (pdu.payload.length >= 1) return { hiRes: pdu.payload[0] === 1 };
        break;
      case 782:
      case 786:
        if (pdu.payload.length >= 1) return { gameMode: pdu.payload[0] === 1 };
        break;
      case 787:
      case 789:
        if (pdu.payload.length >= 1) return { volBoost: pdu.payload[0] === 1 };
        break;
      case 1026:
        if (pdu.payload.length >= 1) return { inEarFeatureEnabled: pdu.payload[0] === 1 };
        break;
      case 1028:
        // As per diagnostics, Opcode 1028 payload is ~10 bytes
        // Index 6 = Left In-Ear status (1 = In, 0 = Out)
        // Index 7 = Right In-Ear status (1 = In, 0 = Out)
        if (pdu.payload.length >= 8) {
           return { 
              physicallyInEarL: pdu.payload[6] === 1, 
              physicallyInEarR: pdu.payload[7] === 1 
           };
        }
        break;
      case 1025: // Fit Test Result
        if (pdu.payload.length >= 1) return { fitTestResult: pdu.payload[0], fitTestRunning: false };
        break;
    }
    return {};
  }),

  setAncMode: (mode, subMode) => {
    if ((window as any).sendOpcodeToDevice) {
      (window as any).sendOpcodeToDevice(513, [mode, subMode]);
    }// Optimistic update
    set({ ancMode: mode, ancSubMode: subMode });
  },

  setEqState: (enabled) => {
    if ((window as any).sendOpcodeToDevice) {
      (window as any).sendOpcodeToDevice(771, [enabled ? 1 : 0]);
    }
    set({ eqState: enabled });
  },

  setGameMode: (enabled) => {
    if ((window as any).sendOpcodeToDevice) {
      (window as any).sendOpcodeToDevice(783, [enabled ? 1 : 0]);
    }
    set({ gameMode: enabled });
  },

  setHiRes: (enabled) => {
    if ((window as any).sendOpcodeToDevice) {
      (window as any).sendOpcodeToDevice(781, [enabled ? 1 : 0]);
    }
    set({ hiRes: enabled });
  },

  setInEarFeature: (enabled) => {
    if ((window as any).sendOpcodeToDevice) {
      (window as any).sendOpcodeToDevice(1027, [enabled ? 1 : 0]);
    }
    set({ inEarFeatureEnabled: enabled });
  },

  setVolBoost: (enabled) => {
    if ((window as any).sendOpcodeToDevice) {
      (window as any).sendOpcodeToDevice(788, [enabled ? 1 : 0]);
    }
    set({ volBoost: enabled });
  }
}));
