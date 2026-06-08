import { useDeviceStore } from '../store/useDeviceStore';
import { ArrowLeft, Hand } from 'lucide-react';
import { motion } from 'framer-motion';

export const GesturesMenu = () => {
  const { setCurrentView } = useDeviceStore();

  return (
    <motion.div 
      className="hero-container submenu-container"
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
    >
      <div className="hero-header">
        <button className="skeuo-icon-btn" onClick={() => setCurrentView('main')}>
          <ArrowLeft size={22} className="metal-icon" />
        </button>
        <h2 className="embossed-text">Gestures</h2>
        <div style={{width: 44}}></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, gap: '20px' }}>
        <div className="skeuo-orb">
          <Hand size={48} className="metal-icon" />
        </div>
        <h3 className="embossed-text">Coming Soon</h3>
        <p className="engraved-text sm text-center" style={{ maxWidth: '80%' }}>
          Gesture customization protocol is still being reverse-engineered. Stay tuned for updates!
        </p>
      </div>
    </motion.div>
  );
};
