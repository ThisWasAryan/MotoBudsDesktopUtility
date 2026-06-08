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
    charging: boolean;
  };
  ancMode: number;
  ancSubMode: number;
  eqState: boolean;
  hiRes: boolean;
  gameMode: boolean;
  inEar: boolean;
  volBoost: boolean;
  fitTestRunning: boolean;
  fitTestResult: number | null;
  
  // Actions
  setDevice: (data: any) => void;
  disconnect: () => void;
  updateStateFromPdu: (pdu: any) => void;
  setAncMode: (mode: number, subMode: number) => void;
  setEqState: (enabled: boolean) => void;
  setGameMode: (enabled: boolean) => void;
  setHiRes: (enabled: boolean) => void;
  setInEar: (enabled: boolean) => void;
  setVolBoost: (enabled: boolean) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  connected: false,
  modelId: null,
  name: null,
  features: [],
  battery: { left: null, right: null, case: null, charging: false },
  ancMode: 0,
  ancSubMode: 0,
  eqState: false,
  hiRes: false,
  gameMode: false,
  inEar: false,
  volBoost: false,
  fitTestRunning: false,
  fitTestResult: null,

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
        if (pdu.payload.length >= 3) {
          return {
            battery: {
              left: pdu.payload[0] & 0x7F,
              right: pdu.payload[1] & 0x7F,
              case: (pdu.payload[2] & 0x7F) > 100 ? null : (pdu.payload[2] & 0x7F),
              charging: (pdu.payload[0] & 0x80) > 0 || (pdu.payload[2] & 0x80) > 0
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
      case 1028:
        if (pdu.payload.length >= 1) return { inEar: pdu.payload[0] === 1 };
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

  setInEar: (enabled) => {
    if ((window as any).sendOpcodeToDevice) {
      (window as any).sendOpcodeToDevice(1027, [enabled ? 1 : 0]);
    }
    set({ inEar: enabled });
  },

  setVolBoost: (enabled) => {
    if ((window as any).sendOpcodeToDevice) {
      (window as any).sendOpcodeToDevice(788, [enabled ? 1 : 0]);
    }
    set({ volBoost: enabled });
  }
}));
