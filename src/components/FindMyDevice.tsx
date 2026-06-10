import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeviceStore } from '../store/useDeviceStore';
import { Volume2, VolumeX, BellRing } from 'lucide-react';
import leftBud from '../assets/left_bud.png';
import rightBud from '../assets/right_bud.png';


export const FindMyDevice = () => {
  const { 
    fmdLeft, fmdRight, setFmd, battery,
    physicallyInEarL, physicallyInEarR
  } = useDeviceStore();

  const [showWarning, setShowWarning] = useState<'left' | 'right' | null>(null);

  const handleRingLeft = () => {
    if (fmdLeft) {
      setFmd(false, fmdRight);
    } else {
      if (physicallyInEarL) {
        setShowWarning('left');
      } else {
        setFmd(true, fmdRight);
      }
    }
  };

  const handleRingRight = () => {
    if (fmdRight) {
      setFmd(fmdLeft, false);
    } else {
      if (physicallyInEarR) {
        setShowWarning('right');
      } else {
        setFmd(fmdLeft, true);
      }
    }
  };

  const confirmRing = () => {
    if (showWarning === 'left') {
      setFmd(true, fmdRight);
    } else if (showWarning === 'right') {
      setFmd(fmdLeft, true);
    }
    setShowWarning(null);
  };

  const handleStopAll = () => {
    setFmd(false, false);
  };

  return (
    <motion.div 
      className="right-content panel-container"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="menu-header">
        <h2 className="menu-title">Find My Device</h2>
        <p className="menu-subtitle">Locate your misplaced earbuds by playing a sound.</p>
      </div>

      <div className="menu-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Warning card */}
        <div className="status-card" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div className="status-header">
            <span className="status-title" style={{ color: '#ef4444' }}>Warning</span>
          </div>
          <div className="status-description" style={{ color: 'rgba(255,255,255,0.7)' }}>
            The earbuds will play a very loud sound. Do not use this feature while wearing them in your ears.
          </div>
        </div>

        {/* Earbud Grid */}
        <div style={{ display: 'flex', gap: '16px' }}>
          
          {/* Left Earbud */}
          <div className="feature-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
             {fmdLeft && (
               <motion.div 
                 className="ringing-ring" 
                 style={{ position: 'absolute', inset: 0, border: '2px solid var(--accent)', borderRadius: '16px', opacity: 0.5, pointerEvents: 'none', zIndex: 1 }}
                 animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0, 0.5] }}
                 transition={{ duration: 1.5, repeat: Infinity }}
               />
             )}
             <div style={{ padding: '20px 0', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <img src={leftBud} alt="Left Earbud" style={{ maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))', zIndex: 2, position: 'relative' }} />
             </div>
             <h3 className="feature-title" style={{ marginBottom: '4px' }}>Left Earbud</h3>
             <span className="type-battery-label" style={{ marginBottom: '16px' }}>
                {battery.inCaseL ? 'In Case' : 'Out of Case'}
             </span>
             
             <button 
               onClick={handleRingLeft}
               disabled={battery.inCaseL}
               style={{
                 width: '100%',
                 padding: '10px',
                 borderRadius: '8px',
                 border: 'none',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 gap: '8px',
                 cursor: battery.inCaseL ? 'not-allowed' : 'pointer',
                 backgroundColor: fmdLeft ? 'var(--danger)' : 'var(--accent)',
                 color: fmdLeft ? '#ffffff' : '#000000',
                 fontWeight: '600',
                 opacity: battery.inCaseL ? 0.5 : 1,
                 transition: 'background-color 0.2s',
                 zIndex: 2,
                 position: 'relative'
               }}
             >
               {fmdLeft ? <VolumeX size={18} /> : <Volume2 size={18} />}
               {fmdLeft ? 'Click here to stop ringing' : 'Ring Left'}
             </button>
          </div>

          {/* Right Earbud */}
          <div className="feature-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
             {fmdRight && (
               <motion.div 
                 className="ringing-ring" 
                 style={{ position: 'absolute', inset: 0, border: '2px solid var(--accent)', borderRadius: '16px', opacity: 0.5, pointerEvents: 'none', zIndex: 1 }}
                 animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0, 0.5] }}
                 transition={{ duration: 1.5, repeat: Infinity }}
               />
             )}
             <div style={{ padding: '20px 0', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <img src={rightBud} alt="Right Earbud" style={{ maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))', zIndex: 2, position: 'relative' }} />
             </div>
             <h3 className="feature-title" style={{ marginBottom: '4px' }}>Right Earbud</h3>
             <span className="type-battery-label" style={{ marginBottom: '16px' }}>
                {battery.inCaseR ? 'In Case' : 'Out of Case'}
             </span>
             
             <button 
               onClick={handleRingRight}
               disabled={battery.inCaseR}
               style={{
                 width: '100%',
                 padding: '10px',
                 borderRadius: '8px',
                 border: 'none',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 gap: '8px',
                 cursor: battery.inCaseR ? 'not-allowed' : 'pointer',
                 backgroundColor: fmdRight ? 'var(--danger)' : 'var(--accent)',
                 color: fmdRight ? '#ffffff' : '#000000',
                 fontWeight: '600',
                 opacity: battery.inCaseR ? 0.5 : 1,
                 transition: 'background-color 0.2s',
                 zIndex: 2,
                 position: 'relative'
               }}
             >
               {fmdRight ? <VolumeX size={18} /> : <Volume2 size={18} />}
               {fmdRight ? 'Click here to stop ringing' : 'Ring Right'}
             </button>
          </div>

        </div>

        {/* Global Stop Button */}
        {(fmdLeft || fmdRight) && (
          <button 
            onClick={handleStopAll}
            style={{
               width: '100%',
               padding: '14px',
               borderRadius: '12px',
               border: 'none',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               gap: '8px',
               cursor: 'pointer',
               backgroundColor: '#1f2937',
               color: '#f87171',
               fontWeight: '600',
               marginTop: '8px',
               border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <BellRing size={18} />
            Stop All Ringing
          </button>
        )}

      </div>

      {/* Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: '20px'
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{
                backgroundColor: '#1f2937',
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '320px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <h3 style={{ marginTop: 0, color: '#ef4444', fontSize: '1.2rem', marginBottom: '12px' }}>Warning</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '24px' }}>
                The {showWarning} earphone is detected to be in your ear. 
                Are you sure you want to ring it?
              </p>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setShowWarning(null)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'transparent',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmRing}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Ring it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
