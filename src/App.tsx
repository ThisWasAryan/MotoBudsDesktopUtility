import { useState, useEffect } from 'react';
import { useDeviceStore } from './store/useDeviceStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, Radio, Loader2, Settings, Battery, BatteryCharging, Gamepad2, Volume2, Ear, Activity } from 'lucide-react';
import './App.css'; // Assuming we'll add custom skeuomorphic CSS here

declare global {
  interface Window {
    api: {
      motoCommand: (args: string[]) => Promise<{ status: string, message?: string, data?: any, raw?: string }>;
    };
  }
}

function App() {
  const { 
    connected, name, modelId, battery, ancMode, gameMode, inEar, volBoost, hiRes,
    setDevice, updateStateFromPdu, disconnect, 
    setAncMode, setGameMode, setInEar, setVolBoost, setHiRes 
  } = useDeviceStore();
  
  const [isInitializing, setIsInitializing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Connect your earbuds to begin.');
  const [showSettings, setShowSettings] = useState(false);

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
          battery: { left: null, right: null, case: null, charging: false }
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
    <div className="hero-container">
      {/* Top Header */}
      <div className="hero-header">
        <div className="device-id-badge">
          <div className="status-led active"></div>
          <span className="embossed-text sm">{name || modelId || 'Moto Buds'}</span>
        </div>
        <button className="skeuo-icon-btn" onClick={() => setShowSettings(true)}>
          <Settings size={22} className="metal-icon" />
        </button>
      </div>

      {/* Main Display / Device Art */}
      <div className="hero-art">
         <div className="skeuo-device-plate">
            <Headphones size={80} className="metal-icon lg" />
         </div>
      </div>

      {/* Battery Dashboard */}
      <div className="skeuo-panel battery-panel">
         <div className="battery-pod">
           <span className="engraved-text xs">L</span>
           <div className="skeuo-battery-bar">
             <div className="fill" style={{ height: `${battery.left || 0}%`, backgroundColor: (battery.left || 0) < 20 ? '#ff4d4f' : '#52c41a' }}></div>
           </div>
           <span className="embossed-text">{battery.left !== null ? `${battery.left}%` : '--'}</span>
         </div>

         <div className="battery-pod case">
           <span className="engraved-text xs">CASE</span>
           {battery.charging && <BatteryCharging size={16} className="metal-icon xs" style={{ position:'absolute', top: 5 }} />}
           <div className="skeuo-battery-bar case-bar">
             <div className="fill" style={{ height: `${battery.case || 0}%`, backgroundColor: '#1890ff' }}></div>
           </div>
           <span className="embossed-text">{battery.case !== null ? `${battery.case}%` : '--'}</span>
         </div>

         <div className="battery-pod">
           <span className="engraved-text xs">R</span>
           <div className="skeuo-battery-bar">
             <div className="fill" style={{ height: `${battery.right || 0}%`, backgroundColor: (battery.right || 0) < 20 ? '#ff4d4f' : '#52c41a' }}></div>
           </div>
           <span className="embossed-text">{battery.right !== null ? `${battery.right}%` : '--'}</span>
         </div>
      </div>

      {/* ANC Slider Hardware Switch */}
      <div className="skeuo-panel anc-panel">
         <h3 className="engraved-text sm">NOISE CONTROL</h3>
         <div className="hardware-slider-track">
            <div 
               className={`hardware-slider-thumb pos-${ancMode}`}
            ></div>
            <div className="slider-labels">
               <button className={`label-btn ${ancMode === 0 ? 'active' : ''}`} onClick={() => setAncMode(0, 0)}>Off</button>
               <button className={`label-btn ${ancMode === 2 ? 'active' : ''}`} onClick={() => setAncMode(2, 0)}>Transp.</button>
               <button className={`label-btn ${ancMode === 1 ? 'active' : ''}`} onClick={() => setAncMode(1, 1)}>ANC</button>
            </div>
         </div>
      </div>

      {/* Settings Modal (Dropdown/Overlay) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            className="skeuo-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowSettings(false); }}
          >
            <motion.div 
              className="skeuo-modal"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
               <div className="modal-header">
                 <h2 className="embossed-text">System Preferences</h2>
                 <button className="close-btn" onClick={() => setShowSettings(false)}>×</button>
               </div>
               
               <div className="settings-list">
                 <div className="skeuo-toggle-row">
                   <div className="row-info">
                     <Gamepad2 size={20} className="metal-icon" />
                     <span className="embossed-text sm">Low Latency Game Mode</span>
                   </div>
                   <button className={`skeuo-toggle ${gameMode ? 'on' : 'off'}`} onClick={() => setGameMode(!gameMode)}>
                     <div className="thumb"></div>
                   </button>
                 </div>

                 <div className="skeuo-toggle-row">
                   <div className="row-info">
                     <Volume2 size={20} className="metal-icon" />
                     <span className="embossed-text sm">Volume Boost</span>
                   </div>
                   <button className={`skeuo-toggle ${volBoost ? 'on' : 'off'}`} onClick={() => setVolBoost(!volBoost)}>
                     <div className="thumb"></div>
                   </button>
                 </div>

                 <div className="skeuo-toggle-row">
                   <div className="row-info">
                     <Ear size={20} className="metal-icon" />
                     <span className="embossed-text sm">In-Ear Detection</span>
                   </div>
                   <button className={`skeuo-toggle ${inEar ? 'on' : 'off'}`} onClick={() => setInEar(!inEar)}>
                     <div className="thumb"></div>
                   </button>
                 </div>

                 <div className="skeuo-toggle-row">
                   <div className="row-info">
                     <Activity size={20} className="metal-icon" />
                     <span className="embossed-text sm">Hi-Res Audio (LDAC)</span>
                   </div>
                   <button className={`skeuo-toggle ${hiRes ? 'on' : 'off'}`} onClick={() => setHiRes(!hiRes)}>
                     <div className="thumb"></div>
                   </button>
                 </div>
               </div>
               
               <p className="engraved-text xs text-center" style={{marginTop: 20}}>
                 Warning: Toggling Hi-Res Audio will force an immediate Bluetooth reconnection.
               </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
