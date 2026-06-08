import { useState, useEffect } from 'react';
import { useDeviceStore } from './store/useDeviceStore';
import { Headphones, Radio, Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import { MainDashboard } from './components/MainDashboard';
import { SoundMenu } from './components/SoundMenu';
import { MoreMenu } from './components/MoreMenu';
import { GesturesMenu } from './components/GesturesMenu';
import { FitTest } from './components/FitTest';
import { RingEarbuds } from './components/RingEarbuds';

import './App.css'; 

declare global {
  interface Window {
    api: {
      motoCommand: (args: string[]) => Promise<{ status: string, message?: string, data?: any, raw?: string }>;
    };
  }
}

function App() {
  const { 
    connected, setDevice, updateStateFromPdu, disconnect, currentView 
  } = useDeviceStore();
  
  const [isInitializing, setIsInitializing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Connect your earbuds to begin.');

  const parseAndInjectPDU = (hexStr: string) => {
    try {
      if (!hexStr || hexStr.length < 16) return;
      const bytes = new Uint8Array(hexStr.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      
      let offset = 0;
      while (offset + 22 <= bytes.length) {
        if (bytes[offset] !== 0x48 || bytes[offset+1] !== 0x45 || bytes[offset+2] !== 0x41 || bytes[offset+3] !== 0x44) {
          offset++;
          continue;
        }
        const opcode = (bytes[offset+6] << 8) | bytes[offset+7];
        const actualPayloadLen = bytes[offset+10] | (bytes[offset+11] << 8);
        if (offset + 22 + actualPayloadLen > bytes.length) break;
        const payload = Array.from(bytes.slice(offset+14, offset+14 + actualPayloadLen));
        updateStateFromPdu({ opcode, payload });
        offset += 22 + actualPayloadLen;
      }
    } catch (e) {
      console.error("Failed to parse PDU:", e);
    }
  };

  const connectDevice = async () => {
    if (!window.api || !window.api.motoCommand) {
      setStatusMsg("Electron API missing. Please run 'npm run dev' and use the desktop window.");
      return;
    }
    setIsInitializing(true);
    setStatusMsg('Connecting via SPP and reading battery...');

    try {
      const batteryRes = await window.api.motoCommand(['--battery']);
      if (batteryRes.status === 'success') {
        setDevice({
          name: "Moto Buds",
          modelId: "XT-SPP",
          features: [104, 109, 110, 113, 116], 
          battery: { left: null, right: null, case: null, chargingL: false, chargingR: false, chargingCase: false, inCaseL: false, inCaseR: false }
        });
        
        if (batteryRes.data?.battery_raw) parseAndInjectPDU(batteryRes.data.battery_raw);

        setStatusMsg('Reading hardware info...');
        const infoRes = await window.api.motoCommand(['--info']);
        if (infoRes.data?.hardware_raw) parseAndInjectPDU(infoRes.data.hardware_raw);
        
        setInterval(async () => {
            const pollRes = await window.api.motoCommand(['--battery']);
            if (pollRes.data?.battery_raw) parseAndInjectPDU(pollRes.data.battery_raw);
        }, 15000);

      } else {
        setStatusMsg(`Failed: ${batteryRes.message}`);
        disconnect();
      }
    } catch (err: any) {
      setStatusMsg(`Connection error: ${err.message}`);
      disconnect();
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    (window as any).sendOpcodeToDevice = async (opcode: number, payload: number[]) => {
       if (opcode === 513) await window.api.motoCommand(['--anc', payload[0].toString()]);
       else if (opcode === 783) await window.api.motoCommand(['--game', payload[0].toString()]);
       else if (opcode === 1027) await window.api.motoCommand(['--inear', payload[0].toString()]);
       else if (opcode === 788) await window.api.motoCommand(['--volboost', payload[0].toString()]);
       else if (opcode === 781) await window.api.motoCommand(['--hires', payload[0].toString()]);
    };
  }, []);

  if (!connected) {
    return (
      <div className="unconnected-container">
        <div className="skeuo-orb">
          <Headphones size={64} className="metal-icon" />
        </div>
        <h1 className="embossed-text">Moto Buds</h1>
        <p className="engraved-text">{statusMsg}</p>
        
        <button className="skeuo-btn connect-btn" onClick={connectDevice} disabled={isInitializing}>
          {isInitializing ? <Loader2 className="loading spinner" size={20} /> : <Radio size={20} />}
          <span>{isInitializing ? 'Connecting...' : 'Power On'}</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {currentView === 'main' && <MainDashboard key="main" />}
        {currentView === 'sound' && <SoundMenu key="sound" />}
        {currentView === 'more' && <MoreMenu key="more" />}
        {currentView === 'gestures' && <GesturesMenu key="gestures" />}
        {currentView === 'fit-test' && <FitTest key="fit-test" />}
        {currentView === 'ring-earbuds' && <RingEarbuds key="ring-earbuds" />}
      </AnimatePresence>
    </div>
  );
}

export default App;
