import { useDeviceStore } from '../store/useDeviceStore';
import { Gamepad2, Volume2, Activity, ArrowLeft, Radio, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export const SoundMenu = () => {
  const { setCurrentView, gameMode, setGameMode, volBoost, setVolBoost, hiRes, setHiRes } = useDeviceStore();

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
        <h2 className="embossed-text">Sound</h2>
        <div style={{width: 44}}></div> {/* Spacer */}
      </div>

      <div className="settings-list" style={{ marginTop: '20px' }}>
        <div className="skeuo-toggle-row">
          <div className="row-info">
            <Radio size={20} className="metal-icon" />
            <div>
              <div className="embossed-text sm">Spatial audio</div>
              <div className="engraved-text xs">Hear immersive, three-dimensional audio</div>
            </div>
          </div>
        </div>

        <div className="skeuo-toggle-row interactive" style={{ cursor: 'pointer' }}>
          <div className="row-info">
            <SlidersHorizontal size={20} className="metal-icon" />
            <div>
              <div className="embossed-text sm">Equaliser</div>
              <div className="engraved-text xs">Flat</div>
            </div>
          </div>
        </div>

        <div className="skeuo-toggle-row">
          <div className="row-info">
            <Activity size={20} className="metal-icon" />
            <div>
              <div className="embossed-text sm">Hi-res mode</div>
              <div className="engraved-text xs">Play audio in high resolution</div>
            </div>
          </div>
          <button className={`skeuo-toggle ${hiRes ? 'on' : 'off'}`} onClick={() => setHiRes(!hiRes)}>
            <div className="thumb"></div>
          </button>
        </div>

        <div className="skeuo-toggle-row">
          <div className="row-info">
            <Gamepad2 size={20} className="metal-icon" />
            <div>
              <div className="embossed-text sm">Gaming mode</div>
              <div className="engraved-text xs">Minimise latency for improved gaming</div>
            </div>
          </div>
          <button className={`skeuo-toggle ${gameMode ? 'on' : 'off'}`} onClick={() => setGameMode(!gameMode)}>
            <div className="thumb"></div>
          </button>
        </div>

        <div className="skeuo-toggle-row">
          <div className="row-info">
            <Volume2 size={20} className="metal-icon" />
            <div>
              <div className="embossed-text sm">Volume boost</div>
              <div className="engraved-text xs">Increase the maximum volume</div>
            </div>
          </div>
          <button className={`skeuo-toggle ${volBoost ? 'on' : 'off'}`} onClick={() => setVolBoost(!volBoost)}>
            <div className="thumb"></div>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
