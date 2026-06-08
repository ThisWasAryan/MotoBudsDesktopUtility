import { useState, useEffect } from 'react';
import { useDeviceStore } from '../store/useDeviceStore';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const Equalizer = () => {
  const { setCurrentView, eqBands, setEqBands } = useDeviceStore();
  const [localBands, setLocalBands] = useState<number[]>(eqBands);

  useEffect(() => {
    setLocalBands(eqBands);
  }, [eqBands]);

  const freqs = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];

  const commitBands = () => {
    setEqBands(localBands);
  };

  return (
    <motion.div 
      className="hero-container submenu-container"
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
    >
      <div className="hero-header">
        <button className="skeuo-icon-btn" onClick={() => setCurrentView('sound')}>
          <ArrowLeft size={22} className="metal-icon" />
        </button>
        <h2 className="embossed-text">Custom Equaliser</h2>
        <div style={{width: 44}}></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', marginTop: '20px' }}>
        
        <div className="skeuo-panel" style={{ padding: '30px 20px', margin: '0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '200px' }}>
            {freqs.map((freq, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <span className="engraved-text xs">{localBands[i] > 0 ? '+' : ''}{localBands[i].toFixed(1)}</span>
                <input 
                  type="range" 
                  min="-3" max="3" step="0.1"
                  value={localBands[i]}
                  onChange={(e) => {
                     const newB = [...localBands];
                     newB[i] = parseFloat(e.target.value);
                     setLocalBands(newB);
                  }}
                  onPointerUp={commitBands}
                  style={{ WebkitAppearance: 'slider-vertical', width: '24px', height: '120px', cursor: 'pointer' }}
                />
                <span className="embossed-text xs">{freq}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
};
