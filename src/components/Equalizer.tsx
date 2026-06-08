import { useDeviceStore } from '../store/useDeviceStore';
import { ArrowLeft, SlidersHorizontal, Sliders } from 'lucide-react';
import { motion } from 'framer-motion';

export const Equalizer = () => {
  const { setCurrentView, eqState, setEqState } = useDeviceStore();

  const presets = [
    { id: 0, name: 'Flat', icon: <SlidersHorizontal size={20} /> },
    { id: 1, name: 'Bass Boost', icon: <Sliders size={20} /> },
    { id: 2, name: 'Vocal Boost', icon: <Sliders size={20} /> },
    { id: 3, name: 'Treble Boost', icon: <Sliders size={20} /> },
  ];

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
        <h2 className="embossed-text">Equaliser</h2>
        <div style={{width: 44}}></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
        {presets.map((preset) => (
          <div 
            key={preset.id}
            className={`skeuo-toggle-row clickable ${eqState === preset.id ? 'active' : ''}`}
            onClick={() => setEqState(preset.id)}
            style={{ 
               cursor: 'pointer',
               border: eqState === preset.id ? '2px solid var(--accent-blue)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="metal-icon" style={{ color: eqState === preset.id ? 'var(--accent-blue)' : 'inherit' }}>
                 {preset.icon}
              </div>
              <span className="embossed-text sm">{preset.name}</span>
            </div>
          </div>
        ))}
      </div>
      
    </motion.div>
  );
};
