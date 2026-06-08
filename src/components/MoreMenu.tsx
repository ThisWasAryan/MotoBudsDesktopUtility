import { useDeviceStore } from '../store/useDeviceStore';
import { Ear, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

export const MoreMenu = () => {
  const { modelId, inEarFeatureEnabled, setInEarFeature } = useDeviceStore();

  return (
    <motion.div 
      className="right-content"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
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
