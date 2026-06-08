import { useState } from 'react';
import { useDeviceStore } from '../store/useDeviceStore';
import { ArrowLeft, VolumeX, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const RingEarbuds = () => {
  const { setCurrentView, name, battery } = useDeviceStore();
  const [ringingL, setRingingL] = useState(false);
  const [ringingR, setRingingR] = useState(false);

  const toggleRing = async (side: 'L' | 'R') => {
    // Opcode 1029: payload [1] = Left, [2] = Right, [0] = Stop (guess based on standard conventions)
    let mode = 0;
    
    if (side === 'L') {
      const newState = !ringingL;
      setRingingL(newState);
      if (newState) mode = 1; else if (ringingR) mode = 2; else mode = 0;
    } else {
      const newState = !ringingR;
      setRingingR(newState);
      if (newState) mode = 2; else if (ringingL) mode = 1; else mode = 0;
    }
    
    if (window.api && window.api.motoCommand) {
      await window.api.motoCommand({ op: 'fmd', action: mode });
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
        <h2 className="embossed-text">Ring my earbuds</h2>
        <div style={{width: 44}}></div>
      </div>

      <div className="device-id-badge" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span className="embossed-text sm">{name || 'Moto Buds'}</span>
        <div style={{ display: 'flex', gap: '20px', marginTop: '4px' }}>
          <span className="engraved-text xs">Left: {battery.left}%</span>
          <span className="engraved-text xs">Right: {battery.right}%</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '60px' }}>
        {/* Left Earbud */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div className="skeuo-orb" style={{ width: 80, height: 80, borderRadius: '20px' }}>
             {/* Stub for earbud graphic */}
             <div className="engraved-text">L</div>
          </div>
          
          <button 
            className={`skeuo-icon-btn ${ringingL ? 'active' : ''}`} 
            style={{ width: 60, height: 60, border: ringingL ? '2px solid var(--accent-blue)' : 'none' }}
            onClick={() => toggleRing('L')}
          >
            {ringingL ? <Volume2 size={28} className="metal-icon" color="var(--accent-blue)" /> : <VolumeX size={28} className="metal-icon" />}
          </button>
          <span className="embossed-text sm">{ringingL ? 'Stop left' : 'Ring left'}</span>
        </div>

        {/* Right Earbud */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div className="skeuo-orb" style={{ width: 80, height: 80, borderRadius: '20px' }}>
             {/* Stub for earbud graphic */}
             <div className="engraved-text">R</div>
          </div>
          
          <button 
            className={`skeuo-icon-btn ${ringingR ? 'active' : ''}`} 
            style={{ width: 60, height: 60, border: ringingR ? '2px solid var(--accent-blue)' : 'none' }}
            onClick={() => toggleRing('R')}
          >
            {ringingR ? <Volume2 size={28} className="metal-icon" color="var(--accent-blue)" /> : <VolumeX size={28} className="metal-icon" />}
          </button>
          <span className="embossed-text sm">{ringingR ? 'Stop right' : 'Ring right'}</span>
        </div>
      </div>
      
      <div style={{ marginTop: 'auto', marginBottom: '20px', textAlign: 'center' }}>
        <p className="engraved-text sm">To protect your hearing, don't use this feature while wearing your earbuds.</p>
      </div>
    </motion.div>
  );
};
