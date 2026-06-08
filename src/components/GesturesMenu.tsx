import { useState } from 'react';
import { useDeviceStore } from '../store/useDeviceStore';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';

export const GesturesMenu = () => {
  const { setCurrentView } = useDeviceStore();
  const [activeTab, setActiveTab] = useState<'Left' | 'Right'>('Right');

  // Dummy state for toggles based on the screenshot
  const [toggles, setToggles] = useState({
    Left: { doubleTap: true, tripleTap: true, pressHold: true },
    Right: { doubleTap: true, tripleTap: true, pressHold: true }
  });

  const handleToggle = (gesture: 'doubleTap' | 'tripleTap' | 'pressHold') => {
    setToggles(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [gesture]: !prev[activeTab][gesture]
      }
    }));
  };

  const currentToggles = toggles[activeTab];

  return (
    <motion.div 
      className="hero-container submenu-container"
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      style={{ padding: 0, overflowX: 'hidden' }}
    >
      <div className="hero-header" style={{ padding: '24px 24px 0' }}>
        <button className="skeuo-icon-btn" onClick={() => setCurrentView('main')} style={{ background: 'transparent', boxShadow: 'none' }}>
          <ArrowLeft size={24} className="metal-icon" color="#fff" />
        </button>
        <h2 className="embossed-text" style={{ fontSize: '20px' }}>Gestures</h2>
        <button className="skeuo-icon-btn" style={{ background: 'transparent', boxShadow: 'none' }}>
          <MoreVertical size={24} className="metal-icon" color="#fff" />
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom: '20px' }}>
         <div className="skeuo-orb" style={{ width: 120, height: 120, borderRadius: '20px', background: 'transparent', boxShadow: 'none' }}>
            {/* We don't have the 3D asset, so we leave it blank or place a placeholder icon */}
            <img 
               src="../../assets/devices/moto_buds.png" 
               alt="Earbud" 
               style={{ width: '100%', height: '100%', objectFit: 'contain', filter: activeTab === 'Left' ? 'none' : 'scaleX(-1)' }} 
               onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
         </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #2a2a2a' }}>
        <div 
          onClick={() => setActiveTab('Left')}
          style={{ flex: 1, textAlign: 'center', padding: '16px 0', cursor: 'pointer', position: 'relative' }}
        >
          <span className="embossed-text sm" style={{ color: activeTab === 'Left' ? '#fff' : '#888' }}>Left</span>
          {activeTab === 'Left' && <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '30px', height: '3px', background: '#8ab4f8', borderRadius: '3px 3px 0 0' }}></div>}
        </div>
        <div 
          onClick={() => setActiveTab('Right')}
          style={{ flex: 1, textAlign: 'center', padding: '16px 0', cursor: 'pointer', position: 'relative' }}
        >
          <span className="embossed-text sm" style={{ color: activeTab === 'Right' ? '#fff' : '#888' }}>Right</span>
          {activeTab === 'Right' && <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '30px', height: '3px', background: '#8ab4f8', borderRadius: '3px 3px 0 0' }}></div>}
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Double-tap Card */}
        <div className="skeuo-panel" style={{ padding: '20px', margin: 0, borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="embossed-text" style={{ fontSize: '16px' }}>Double-tap</div>
              <div className="engraved-text sm" style={{ color: '#8ab4f8', marginTop: '4px' }}>Play/Pause</div>
            </div>
            <button className={`skeuo-toggle ${currentToggles.doubleTap ? 'on' : 'off'}`} onClick={() => handleToggle('doubleTap')}>
              <div className="thumb"></div>
            </button>
          </div>
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #2a2a2a' }}>
            <span className="engraved-text sm" style={{ color: '#aaa' }}>Double-tapping will always answer/end a call</span>
          </div>
        </div>

        {/* Triple-tap Card */}
        <div className="skeuo-panel" style={{ padding: '20px', margin: 0, borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="embossed-text" style={{ fontSize: '16px' }}>Triple-tap</div>
              <div className="engraved-text sm" style={{ color: '#8ab4f8', marginTop: '4px' }}>{activeTab === 'Right' ? 'Next' : 'Previous'}</div>
            </div>
            <button className={`skeuo-toggle ${currentToggles.tripleTap ? 'on' : 'off'}`} onClick={() => handleToggle('tripleTap')}>
              <div className="thumb"></div>
            </button>
          </div>
        </div>

        {/* Press and hold Card */}
        <div className="skeuo-panel" style={{ padding: '20px', margin: 0, borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="embossed-text" style={{ fontSize: '16px' }}>Press and hold</div>
              <div className="engraved-text sm" style={{ color: '#8ab4f8', marginTop: '4px' }}>{activeTab === 'Right' ? 'Noise control' : 'Voice assistant'}</div>
            </div>
            <button className={`skeuo-toggle ${currentToggles.pressHold ? 'on' : 'off'}`} onClick={() => handleToggle('pressHold')}>
              <div className="thumb"></div>
            </button>
          </div>
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #2a2a2a' }}>
            <span className="engraved-text sm" style={{ color: '#aaa' }}>Press and hold will always decline a call</span>
          </div>
        </div>

        {/* View tutorial Card */}
        <div className="skeuo-panel interactive" style={{ padding: '20px', margin: 0, borderRadius: '24px', cursor: 'pointer' }}>
          <div className="embossed-text" style={{ fontSize: '16px' }}>View tutorial</div>
          <div className="engraved-text sm" style={{ color: '#8ab4f8', marginTop: '4px' }}>Find out more about earbud controls</div>
        </div>

      </div>
    </motion.div>
  );
};
