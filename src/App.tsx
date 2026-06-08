import { useState, useEffect } from 'react';
import { useDeviceStore } from './store/useDeviceStore';
import { Headphones, Radio, Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import { MainDashboard } from './components/MainDashboard';
import { SoundMenu } from './components/SoundMenu';
import { MoreMenu } from './components/MoreMenu';
import { FitTest } from './components/FitTest';
import { Equalizer } from './components/Equalizer';

import './App.css'; 

declare global {
  interface Window {
    api: {
      motoCommand: (args: any) => Promise<{ status: string, message?: string, data?: any, raw?: string }>;
      startDaemon: () => Promise<{ status: string, message?: string }>;
      onMotoEvent: (callback: any) => void;
      removeMotoEventListener: (callback: any) => void;
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
    if (!window.api || !window.api.startDaemon) {
      setStatusMsg("Electron API missing or outdated. Please restart 'npm run dev'.");
      return;
    }
    setIsInitializing(true);
    setStatusMsg('Starting background Bluetooth daemon...');

    try {
      const daemonRes = await window.api.startDaemon();
      if (daemonRes.status === 'success') {
        setDevice({
          name: "Moto Buds",
          modelId: "XT-SPP",
          features: [104, 109, 110, 113, 116], 
          battery: { left: null, right: null, case: null, chargingL: false, chargingR: false, chargingCase: false, inCaseL: false, inCaseR: false }
        });
        
        setStatusMsg('Syncing hardware state...');
        
        // Request initial state synchronization from the daemon
        await window.api.motoCommand({ op: "info" });
        await window.api.motoCommand({ op: "sync" });
        await window.api.motoCommand({ op: "battery" });
      } else {
        setStatusMsg(`Failed: ${daemonRes.message}`);
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
    const handleMotoEvent = (_event: any, payload: any) => {
       if (!payload) return;
       
       try {
          if (payload.type === 'event' || payload.type === 'battery' || payload.type === 'info') {
             if (payload.data) parseAndInjectPDU(payload.data);
          } else if (payload.type === 'sync') {
             const data = payload.data;
             if (data.anc_raw) parseAndInjectPDU(data.anc_raw);
             if (data.hires_raw) parseAndInjectPDU(data.hires_raw);
             if (data.game_raw) parseAndInjectPDU(data.game_raw);
             if (data.inear_raw) parseAndInjectPDU(data.inear_raw);
          } else if (payload.type === 'error') {
             console.error("Daemon error:", payload.message);
             if (payload.message && payload.message.includes('attempting to reconnect')) {
                // Do not disconnect the UI, let the daemon handle the auto-reconnect loop
                console.warn("Device is temporarily unavailable (codec renegotiation). Reconnecting...");
             } else if (payload.message && payload.message.includes('Connection dropped')) {
                console.warn("Daemon reported a connection drop. Waiting for background reconnect...");
                setStatusMsg("Device rebooting to switch codecs. Please wait...");
                // Do not call disconnect(). The daemon will automatically reconnect!
             } else {
                setStatusMsg(`Connection error: ${payload.message}`);
                disconnect();
             }
          }
       } catch (e) {
          console.error("Failed to parse incoming event:", e);
       }
    };
    
    if (window.api && window.api.onMotoEvent) {
       window.api.onMotoEvent(handleMotoEvent);
    }

    (window as any).sendOpcodeToDevice = async (opcode: number, payload: number[]) => {
       if (opcode === 513) await window.api.motoCommand({ op: 'anc', mode: payload[0] });
       else if (opcode === 783) await window.api.motoCommand({ op: 'game', enabled: payload[0] });
       else if (opcode === 1027) await window.api.motoCommand({ op: 'inear', enabled: payload[0] });
       else if (opcode === 788) await window.api.motoCommand({ op: 'volboost', enabled: payload[0] });
       else if (opcode === 781) await window.api.motoCommand({ op: 'hires', enabled: payload[0] });
       else if (opcode === 771) await window.api.motoCommand({ op: 'eq', preset: payload[0] });
    };
    
    return () => {
       if (window.api && window.api.removeMotoEventListener) {
          window.api.removeMotoEventListener(handleMotoEvent);
       }
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
        {currentView === 'fit-test' && <FitTest key="fit-test" />}
        {currentView === 'equalizer' && <Equalizer key="equalizer" />}
      </AnimatePresence>
    </div>
  );
}

export default App;
