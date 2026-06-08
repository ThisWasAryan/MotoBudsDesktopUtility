import { useDeviceStore } from '../store/useDeviceStore';
import { Ear, ArrowLeft, Download, Volume1, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

export const MoreMenu = () => {
  const { setCurrentView, modelId, inEarFeatureEnabled, setInEarFeature } = useDeviceStore();

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
        <h2 className="embossed-text">More</h2>
        <div style={{width: 44}}></div> {/* Spacer */}
      </div>

      <div className="settings-list" style={{ marginTop: '20px' }}>
        <div className="skeuo-toggle-row">
          <div className="row-info">
            <Ear size={20} className="metal-icon" />
            <div>
              <div className="embossed-text sm">In-ear detection</div>
              <div className="engraved-text xs">Automatically play audio when earbuds are in</div>
            </div>
          </div>
          <button className={`skeuo-toggle ${inEarFeatureEnabled ? 'on' : 'off'}`} onClick={() => setInEarFeature(!inEarFeatureEnabled)}>
            <div className="thumb"></div>
          </button>
        </div>

        {modelId === 'XT2441-1' && (
          <>
            <div className="skeuo-toggle-row">
              <div className="row-info">
                <Headphones size={20} className="metal-icon" />
                <div>
                  <div className="embossed-text sm">Spatial Audio</div>
                </div>
              </div>
            </div>
            
            <div className="skeuo-toggle-row">
              <div className="row-info">
                <Download size={20} className="metal-icon" />
                <div>
                  <div className="embossed-text sm">Firmware update</div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="skeuo-toggle-row interactive" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('ring-earbuds')}>
          <div className="row-info">
            <Volume1 size={20} className="metal-icon" />
            <div>
              <div className="embossed-text sm">Ring my earbuds</div>
              <div className="engraved-text xs">Locate your earbuds by playing a sound</div>
            </div>
          </div>
        </div>

        <div className="skeuo-toggle-row interactive" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('fit-test')}>
          <div className="row-info">
            <Headphones size={20} className="metal-icon" />
            <div>
              <div className="embossed-text sm">Fit test</div>
              <div className="engraved-text xs">Ensure an excellent earbud fit</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
