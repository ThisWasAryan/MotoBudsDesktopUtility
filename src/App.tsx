import { useState, useEffect } from 'react';
import { useDeviceStore } from './store/useDeviceStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, Sliders, Radio, Settings, Loader2 } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Equalizer from './components/Equalizer';
import NoiseControl from './components/NoiseControl';

// Declare the global Electron API interface
declare global {
  interface Window {
    api: {
      motoCommand: (args: string[]) => Promise<{ status: string, message?: string, data?: any, raw?: string }>;
    };
  }
}

function App() {
  const { connected, setDevice, updateStateFromPdu, disconnect } = useDeviceStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Connect your earbuds to begin.');

  const parseAndInjectPDU = (hexStr: string) => {
    // If the python script returned a raw HEX string response, we inject it into the zustand store!
    try {
      if (hexStr.length < 16) return;
      // Convert HEX string to byte array
      const bytes = new Uint8Array(hexStr.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      
      // Basic extraction mimicking the python backend structure
      // Head (4) + TotalLen (2) + Opcode (2) + Type (1) + Result (1) + PayloadLen (2) + Seq (2) + Payload + CRC (4) + TAIL (4)
      if (bytes.length < 22) return;
      
      const opcode = (bytes[6] << 8) | bytes[7];
// Little endian in python, but wait it's little endian: bytes[11]<<8 | bytes[10]
      const actualPayloadLen = bytes[10] | (bytes[11] << 8);
      
      const payload = Array.from(bytes.slice(14, 14 + actualPayloadLen));
      
      updateStateFromPdu({ opcode, payload });
    } catch (e) {
      console.error("Failed to parse mock PDU:", e);
    }
  };

  const connectDevice = async () => {
    if (!window.api || !window.api.motoCommand) {
      // Running in browser, not Electron! We shouldn't show annoying popups, just a clean message.
      setStatusMsg("Electron API missing. Please run 'npm run dev' and use the desktop window.");
      return;
    }

    setIsInitializing(true);
    setStatusMsg('Connecting via SPP and reading battery...');

    try {
      // We run the python script to connect and fetch battery.
      // The Python script handles the Opcode 0/11/16 handshake, and then reads battery.
      const batteryRes = await window.api.motoCommand(['--battery']);
      if (batteryRes.status === 'success') {
        // Set basic connection state
        setDevice({
          name: "Moto Buds",
          modelId: "XT-SPP",
          features: [104, 109, 110], // Mocking features for ANC, HiRes, GameMode
          battery: { left: null, right: null, case: null, charging: false }
        });
        
        // Pass raw battery hex to the store to parse it perfectly as it did before!
        if (batteryRes.data?.battery_raw) {
           parseAndInjectPDU(batteryRes.data.battery_raw);
        }

        // Now read info
        setStatusMsg('Reading hardware info...');
        const infoRes = await window.api.motoCommand(['--info']);
        if (infoRes.data?.hardware_raw) {
           parseAndInjectPDU(infoRes.data.hardware_raw);
        }
        
        // Setup a polling mechanism for Battery (every 10 seconds)
        // In a real app, we'd keep the python socket open, but for now we poll the CLI.
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

  // Wire up the zustand store's global send function to our new python backend
  useEffect(() => {
    (window as any).sendOpcodeToDevice = async (opcode: number, payload: number[]) => {
       if (opcode === 513) {
           // ANC command
           const mode = payload[0];
           await window.api.motoCommand(['--anc', mode.toString()]);
       }
    };
  }, []);

  if (!connected) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
        <Headphones size={64} color="var(--accent)" style={{ marginBottom: '24px' }} />
        <h1 style={{ marginBottom: '16px' }}>Moto Buds Utility</h1>
        <p style={{ marginBottom: '32px', color: 'var(--text-secondary)' }}>{statusMsg}</p>
        
        <button 
          className="btn btn-primary" 
          onClick={connectDevice}
          disabled={isInitializing}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '16px' }}
        >
          {isInitializing ? <Loader2 className="loading" size={20} /> : <Radio size={20} />}
          {isInitializing ? 'Connecting...' : 'Connect to Device'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div className="sidebar-header">
          <Headphones size={24} color="var(--accent)" />
          <h2>Moto Buds</h2>
        </div>
        
        <div style={{ marginTop: '16px' }}>
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Sliders size={20} />
            Dashboard
          </div>
          <div 
            className={`nav-item ${activeTab === 'noise' ? 'active' : ''}`}
            onClick={() => setActiveTab('noise')}
          >
            <Radio size={20} />
            Noise Control
          </div>
          <div 
            className={`nav-item ${activeTab === 'eq' ? 'active' : ''}`}
            onClick={() => setActiveTab('eq')}
          >
            <Settings size={20} />
            Equalizer
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ height: '100%' }}
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'noise' && <NoiseControl />}
            {activeTab === 'eq' && <Equalizer />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
