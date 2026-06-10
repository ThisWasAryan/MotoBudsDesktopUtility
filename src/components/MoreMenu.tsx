import { useDeviceStore } from '../store/useDeviceStore';
import { Ear, Headphones, BellRing, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const MoreMenu = () => {
  const { modelId, inEarFeatureEnabled, setInEarFeature, setCurrentView } = useDeviceStore();

  return (
    <motion.div 
      className="right-content"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      <div className="page-header">
        <h1 className="page-title">More</h1>
        <p className="page-subtitle">Device preferences and diagnostics</p>
      </div>

      <div className="settings-group">
        {/* In-Ear Detection */}
        <div className="setting-row">
          <div className="setting-info">
            <div className={`setting-icon ${inEarFeatureEnabled ? 'accent' : ''}`}>
              <Ear size={18} />
            </div>
            <div className="setting-text">
              <span className="setting-title">In-Ear Detection</span>
              <span className="setting-desc">Auto-pause when earbuds are removed</span>
            </div>
          </div>
          <button className={`toggle ${inEarFeatureEnabled ? 'on' : 'off'}`} onClick={() => setInEarFeature(!inEarFeatureEnabled)}>
            <div className="toggle-thumb" />
          </button>
        </div>

        {/* Fit Test */}
        <div className="setting-row" onClick={() => setCurrentView('fit-test')} style={{ cursor: 'pointer' }}>
          <div className="setting-info">
            <div className="setting-icon">
              <Headphones size={18} />
            </div>
            <div className="setting-text">
              <span className="setting-title">Fit Test</span>
              <span className="setting-desc">Test the earbud seal for optimal audio</span>
            </div>
          </div>
          <ChevronRight size={20} color="var(--text-3)" />
        </div>

        {/* Find My Device */}
        <div className="setting-row" onClick={() => setCurrentView('ring-earbuds')} style={{ cursor: 'pointer' }}>
          <div className="setting-info">
            <div className="setting-icon">
              <BellRing size={18} />
            </div>
            <div className="setting-text">
              <span className="setting-title">Find My Device</span>
              <span className="setting-desc">Ring lost earbuds</span>
            </div>
          </div>
          <ChevronRight size={20} color="var(--text-3)" />
        </div>

        {/* Spatial Audio — only for Moto Buds+ */}
        {modelId === 'XT2441-1' && (
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-icon">
                <Headphones size={18} />
              </div>
              <div className="setting-text">
                <span className="setting-title">Spatial Audio</span>
                <span className="setting-desc">Available on Moto Buds+ only</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
