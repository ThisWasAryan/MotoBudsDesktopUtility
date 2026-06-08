import { useDeviceStore } from '../store/useDeviceStore';
import { ArrowLeft, Play, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const FitTest = () => {
  const { setCurrentView, physicallyInEarL, physicallyInEarR, fitTestRunning, fitTestResultL, fitTestResultR } = useDeviceStore();

  const startTest = async () => {
    if (!physicallyInEarL || !physicallyInEarR) return;
    
    // Dispatch local state
    useDeviceStore.setState({ fitTestRunning: true, fitTestResultL: null, fitTestResultR: null });

    if (window.api && window.api.motoCommand) {
      await window.api.motoCommand({ op: 'fit', enabled: 1 });
      // The daemon will emit the 0x0401 (1025) result asynchronously which updates the store
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
        
        {fitTestRunning || (fitTestResultL === null && fitTestResultR === null) ? (
          <div className="skeuo-orb" style={{ width: 140, height: 140 }}>
             {fitTestRunning ? (
                <Loader2 size={64} className="metal-icon spinner" color="var(--accent-blue)" />
             ) : (
                <Play size={64} className="metal-icon" style={{ marginLeft: 10 }} />
             )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '24px' }}>
             <div className="skeuo-orb" style={{ width: 100, height: 100, flexDirection: 'column', gap: '8px' }}>
                {fitTestResultL === 1 ? <CheckCircle2 size={36} className="metal-icon" color="var(--success)" /> : <XCircle size={36} className="metal-icon" color="var(--danger)" />}
                <span className="embossed-text xs">Left</span>
             </div>
             <div className="skeuo-orb" style={{ width: 100, height: 100, flexDirection: 'column', gap: '8px' }}>
                {fitTestResultR === 1 ? <CheckCircle2 size={36} className="metal-icon" color="var(--success)" /> : <XCircle size={36} className="metal-icon" color="var(--danger)" />}
                <span className="embossed-text xs">Right</span>
             </div>
          </div>
        )}

        <div style={{ textAlign: 'center', padding: '0 20px' }}>
          {fitTestRunning ? (
            <>
              <h3 className="embossed-text">Testing fit...</h3>
              <p className="engraved-text sm" style={{ marginTop: '12px' }}>Please remain quiet and keep still while the test completes.</p>
            </>
          ) : fitTestResultL !== null && fitTestResultR !== null ? (
            <>
              <h3 className="embossed-text">
                 {fitTestResultL === 1 && fitTestResultR === 1 ? 'Good fit' : 
                  fitTestResultL !== 1 && fitTestResultR !== 1 ? 'Adjust both earbuds' :
                  fitTestResultL !== 1 ? 'Adjust left earbud' : 'Adjust right earbud'}
              </h3>
              <p className="engraved-text sm" style={{ marginTop: '12px' }}>
                 {fitTestResultL === 1 && fitTestResultR === 1 
                   ? 'Your earbuds are providing a good seal.' 
                   : 'Try adjusting the earbuds or using a different tip size for a better seal.'}
              </p>
            </>
          ) : (
            <>
              <h3 className="embossed-text">Test your earbud fit</h3>
              <p className="engraved-text sm" style={{ marginTop: '12px' }}>A good seal improves noise cancellation and audio quality.</p>
            </>
          )}
        </div>

        {(!physicallyInEarL || !physicallyInEarR) && !fitTestRunning && fitTestResultL === null && (
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
