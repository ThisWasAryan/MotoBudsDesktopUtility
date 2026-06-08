import { useDeviceStore } from '../store/useDeviceStore';
import { ArrowLeft, Play, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const FitTest = () => {
  const { setCurrentView, physicallyInEarL, physicallyInEarR, fitTestRunning, fitTestResult } = useDeviceStore();

  const startTest = async () => {
    if (!physicallyInEarL || !physicallyInEarR) return;
    
    // Dispatch local state
    useDeviceStore.setState({ fitTestRunning: true, fitTestResult: null });

    if (window.api && window.api.motoCommand) {
      const res = await window.api.motoCommand(['--fit', '1', '--keepalive', '15']);
      if (res && res.data && res.data.async_events) {
         // The async_events are hex strings. We need to parse them.
         res.data.async_events.forEach((hexEvent: string) => {
            // Very simple hack to parse it in place if window.api.parsePDU is not exposed
            // We know the opcode for fit test result is 1025 (0x0401)
            // If the hexEvent contains 0401, we can just extract the payload manually
            if (hexEvent.includes("0401")) {
               const idx = hexEvent.indexOf("0401");
               if (idx + 6 <= hexEvent.length) {
                  const val = parseInt(hexEvent.substring(idx+4, idx+6), 16);
                  useDeviceStore.setState({ fitTestResult: val, fitTestRunning: false });
               }
            }
         });
      }
      useDeviceStore.setState({ fitTestRunning: false });
    }
  };

  return (
    <motion.div 
      className="hero-container submenu-container"
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
    >
      <div className="hero-header">
        <button className="skeuo-icon-btn" onClick={() => setCurrentView('more')}>
          <ArrowLeft size={22} className="metal-icon" />
        </button>
        <h2 className="embossed-text">Fit test</h2>
        <div style={{width: 44}}></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, gap: '32px' }}>
        
        <div className="skeuo-orb" style={{ width: 140, height: 140 }}>
           {fitTestRunning ? (
              <Loader2 size={64} className="metal-icon spinner" color="var(--accent-blue)" />
           ) : fitTestResult === 0 ? (
              <CheckCircle2 size={64} className="metal-icon" color="var(--success)" />
           ) : fitTestResult === 1 || fitTestResult === 2 ? (
              <XCircle size={64} className="metal-icon" color="var(--danger)" />
           ) : (
              <Play size={64} className="metal-icon" style={{ marginLeft: 10 }} />
           )}
        </div>

        <div style={{ textAlign: 'center', padding: '0 20px' }}>
          {fitTestRunning ? (
            <>
              <h3 className="embossed-text">Testing fit...</h3>
              <p className="engraved-text sm" style={{ marginTop: '12px' }}>Please remain quiet and keep still while the test completes.</p>
            </>
          ) : fitTestResult !== null ? (
            <>
              <h3 className="embossed-text">{fitTestResult === 0 ? 'Good fit' : 'Adjust fit'}</h3>
              <p className="engraved-text sm" style={{ marginTop: '12px' }}>
                 {fitTestResult === 0 ? 'Your earbuds are providing a good seal.' : 'Try adjusting the earbuds or using a different tip size for a better seal.'}
              </p>
            </>
          ) : (
            <>
              <h3 className="embossed-text">Test your earbud fit</h3>
              <p className="engraved-text sm" style={{ marginTop: '12px' }}>A good seal improves noise cancellation and audio quality.</p>
            </>
          )}
        </div>

        {(!physicallyInEarL || !physicallyInEarR) && !fitTestRunning && fitTestResult === null && (
          <div style={{ padding: '12px 24px', background: 'rgba(255, 77, 79, 0.1)', borderRadius: '12px', border: '1px solid var(--danger)' }}>
             <span className="embossed-text sm" style={{ color: 'var(--danger)' }}>Make sure both earbuds are inserted</span>
          </div>
        )}

      </div>
      
      <div style={{ padding: '20px' }}>
        <button 
           className="skeuo-btn connect-btn" 
           style={{ width: '100%', justifyContent: 'center' }} 
           onClick={startTest}
           disabled={fitTestRunning || !physicallyInEarL || !physicallyInEarR}
        >
          {fitTestRunning ? 'Testing...' : 'Start'}
        </button>
      </div>

    </motion.div>
  );
};
