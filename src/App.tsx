import { useState, useEffect } from 'react';
import { useDeviceStore } from './store/useDeviceStore';
import { Loader2, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { MainDashboard } from './components/MainDashboard';
import { SoundMenu } from './components/SoundMenu';
import { MoreMenu } from './components/MoreMenu';
import { FitTest } from './components/FitTest';
import { Equalizer } from './components/Equalizer';
import { FindMyDevice } from './components/FindMyDevice';
import { Gestures } from './components/Gestures';

import budsWithCase from './assets/buds_with_case.png';

declare global {
  interface Window {
    api: {
      isWindows?: boolean;
      motoCommand: (args: any) => Promise<{ status: string, message?: string, data?: any, raw?: string }>;
      startDaemon: (devMode?: boolean) => Promise<{ status: string, message?: string }>;
      onMotoEvent: (callback: any) => void;
      removeMotoEventListener: (callback: any) => void;
      setMinimizeToTray?: (enabled: boolean) => void;
      updateTrayTooltip?: (text: string) => void;
      updateTrayMenu?: (data: any) => void;
      onTrayDialog?: (callback: () => void) => void;
      hideWindow?: () => void;
      openTaskbarSettings?: () => void;
      disableTrayNotification?: () => void;
    };
  }
}

function App() {
  const { 
    connected, setConnected, setDevice, updateStateFromPdu, disconnect, currentView 
  } = useDeviceStore();
  
  const [isInitializing, setIsInitializing] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [statusMsg, setStatusMsg] = useState('Connect your earbuds to begin');
  const [devMode, setDevMode] = useState(false);
  const [showTrayDialog, setShowTrayDialog] = useState(false);

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
      setStatusMsg("Electron API missing. Please restart the app.");
      return;
    }
    setIsInitializing(true);
    setStatusMsg('Connecting...');

    try {
      const daemonRes = await window.api.startDaemon(devMode);
      if (daemonRes.status === 'success') {
        setConnectionSuccess(true);
        setStatusMsg('Syncing device state...');

        setDevice({
          name: "Moto Buds",
          modelId: "XT-SPP",
          features: [104, 109, 110, 113, 116], 
          battery: { left: null, right: null, case: null, chargingL: false, chargingR: false, chargingCase: false, inCaseL: false, inCaseR: false }
        });

        await window.api.motoCommand({ op: "info" });
        await window.api.motoCommand({ op: "sync" });
        await window.api.motoCommand({ op: "battery" });
        
        setTimeout(() => {
          setIsInitializing(false);
          setConnected(true);
        }, 1200);
      } else {
        setStatusMsg(`Failed: ${daemonRes.message}`);
        disconnect();
      }
    } catch (err: any) {
      setStatusMsg(`Connection error: ${err.message}`);
      disconnect();
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    // Sync initial settings with main process
    if (window.api && window.api.setMinimizeToTray) {
      window.api.setMinimizeToTray(useDeviceStore.getState().minimizeToTray);
    }

    if (window.api && window.api.onTrayDialog) {
      window.api.onTrayDialog(() => {
        setShowTrayDialog(true);
      });
    }

    const handleMotoEvent = (_event: any, payload: any) => {
       if (!payload) return;
       
       try {
          if (payload.type === 'log') {
             setLogs(prev => [...prev.slice(-4), payload.message]);
          } else if (payload.type === 'event' || payload.type === 'battery' || payload.type === 'info') {
             if (payload.data) parseAndInjectPDU(payload.data);
          } else if (payload.type === 'sync') {
             const data = payload.data;
             if (data.anc_raw) parseAndInjectPDU(data.anc_raw);
             if (data.hires_raw) parseAndInjectPDU(data.hires_raw);
             if (data.game_raw) parseAndInjectPDU(data.game_raw);
             if (data.inear_raw) parseAndInjectPDU(data.inear_raw);
             if (data.gestures_raw) console.log("RAW_GESTURE_PAYLOAD=" + data.gestures_raw);
          } else if (payload.type === 'status') {
             if (payload.status === 'connected' && useDeviceStore.getState().reconnectStatus !== 'idle') {
                useDeviceStore.getState().setReconnectStatus('success');
                setTimeout(() => useDeviceStore.getState().setReconnectStatus('idle'), 2000);
                window.api.motoCommand({ op: 'sync' });
             }
          } else if (payload.type === 'error') {
             console.error("Daemon error:", payload.message);
             if (payload.message && payload.message.includes('Connection dropped')) {
                useDeviceStore.getState().setReconnectStatus('dropping');
                setTimeout(() => {
                   if (useDeviceStore.getState().reconnectStatus !== 'success') {
                       useDeviceStore.getState().setReconnectStatus('reconnecting');
                   }
                }, 500);
                console.warn("Daemon reported a connection drop. Waiting for background reconnect...");
                setStatusMsg("Device rebooting to switch codecs. Please wait...");
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

  /* ─── Connection Screen ─── */
  if (!connected) {
    return (
      <div className="connect-screen">
        <img src={budsWithCase} alt="Moto Buds" className="connect-hero-image" />
        <h1 className="connect-title">Moto Buds</h1>
        <p className="connect-subtitle">{statusMsg}</p>
        
        <button 
          className={`connect-btn ${connectionSuccess ? 'success' : ''}`} 
          onClick={connectDevice} 
          disabled={isInitializing || connectionSuccess}
          style={connectionSuccess ? { backgroundColor: 'var(--success)', borderColor: 'var(--success)', color: '#000' } : {}}
        >
          {isInitializing && !connectionSuccess ? <Loader2 size={18} className="spinner" /> : null}
          {connectionSuccess ? <Check size={18} /> : null}
          <span>{connectionSuccess ? 'Connected' : isInitializing ? 'Connecting' : 'Connect'}</span>
        </button>

        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-2)', fontSize: '13px' }}>
          <input type="checkbox" id="devMode" checked={devMode} onChange={(e) => setDevMode(e.target.checked)} disabled={isInitializing} />
          <label htmlFor="devMode" style={{ cursor: 'pointer' }}>Developer Mode (Simulate Earbuds)</label>
        </div>

        {logs.length > 0 && (
          <div className="terminal-logs" style={{ marginTop: '24px', width: '320px', textAlign: 'left', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-3)', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ─── Connected: Two-Column Layout ─── */
  const rightPanelContent = () => {
    switch (currentView) {
      case 'sound': return <SoundMenu key="sound" />;
      case 'equalizer': return <Equalizer key="equalizer" />;
      case 'fit-test': return <FitTest key="fit-test" />;
      case 'ring-earbuds': return <FindMyDevice key="ring-earbuds" />;
      case 'gestures': return <Gestures key="gestures" />;
      case 'more': return <MoreMenu key="more" />;
      default: return <WelcomePanel key="welcome" />;
    }
  };

  return (
    <div className="app-layout">
      <div className="left-panel">
        <MainDashboard />
      </div>
      <div className="right-panel">
        <AnimatePresence mode="wait">
          {rightPanelContent()}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showTrayDialog && (
          <div className="dialog-overlay" style={{ zIndex: 9999 }}>
            <motion.div 
              className="dialog-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <h3 className="dialog-title" style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--text-1)' }}>App Minimized to Tray</h3>
              <p className="dialog-body" style={{ fontSize: '14px', color: 'var(--text-2)', marginBottom: '16px', lineHeight: '1.5' }}>
                MotoBudsDesktopUtility is now running in the system tray. To keep the icon visible:<br/><br/>
                <strong>Settings → Personalization → Taskbar → Other system tray icons</strong>
              </p>
              
              <div className="dialog-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button 
                  className="dialog-btn secondary"
                  onClick={() => {
                    if (window.api?.openTaskbarSettings) window.api.openTaskbarSettings();
                    setShowTrayDialog(false);
                    if (window.api?.hideWindow) window.api.hideWindow();
                  }}
                  style={{ background: 'var(--surface-3)', border: 'none', padding: '8px 16px', borderRadius: '6px', color: 'var(--text-1)', cursor: 'pointer', fontSize: '13px' }}
                >
                  Open Taskbar Settings
                </button>
                <button 
                  className="dialog-btn secondary"
                  onClick={() => {
                    setShowTrayDialog(false);
                    if (window.api?.hideWindow) window.api.hideWindow();
                  }}
                  style={{ background: 'var(--surface-3)', border: 'none', padding: '8px 16px', borderRadius: '6px', color: 'var(--text-1)', cursor: 'pointer', fontSize: '13px' }}
                >
                  Got It
                </button>
                <button 
                  className="dialog-btn primary"
                  onClick={() => {
                    if (window.api?.disableTrayNotification) window.api.disableTrayNotification();
                    setShowTrayDialog(false);
                    if (window.api?.hideWindow) window.api.hideWindow();
                  }}
                  style={{ background: 'var(--accent)', border: 'none', padding: '8px 16px', borderRadius: '6px', color: '#000', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
                >
                  Don't remind me again
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Welcome/Default Right Panel ─── */
function WelcomePanel() {
  return (
    <motion.div 
      className="welcome-panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <img src={budsWithCase} alt="Moto Buds" className="welcome-image" />
      <h2 className="welcome-title">Ready to go</h2>
      <p className="welcome-subtitle">
        Select a category from the panel to configure your earbuds
      </p>
    </motion.div>
  );
}

export default App;
