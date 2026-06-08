import { useState } from 'react';
import { useDeviceStore } from '../store/useDeviceStore';
import { Gamepad2, Volume2, Activity, ArrowLeft, Radio, SlidersHorizontal, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SoundMenu = () => {
  const { setCurrentView, name, gameMode, setGameMode, volBoost, setVolBoost, hiRes, setHiRes } = useDeviceStore();
  
  const [conflictDialog, setConflictDialog] = useState<'game' | 'hires' | null>(null);

  const handleToggleHiRes = () => {
    if (!hiRes && gameMode) {
      setConflictDialog('hires');
    } else {
      setHiRes(!hiRes);
    }
  };

  const handleToggleGameMode = () => {
    if (!gameMode && hiRes) {
      setConflictDialog('game');
    } else {
      setGameMode(!gameMode);
    }
  };

  const confirmConflict = () => {
    if (conflictDialog === 'hires') {
      setGameMode(false);
      setTimeout(() => setHiRes(true), 300);
    } else if (conflictDialog === 'game') {
      setHiRes(false);
      setTimeout(() => setGameMode(true), 300);
    }
    setConflictDialog(null);
  };

  return (
    <>
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
          {name === 'Moto Buds+' && (
            <div className="skeuo-toggle-row">
              <div className="row-info">
                <Radio size={20} className="metal-icon" />
                <div>
                  <div className="embossed-text sm">Spatial audio</div>
                  <div className="engraved-text xs">Hear immersive, three-dimensional audio</div>
                </div>
              </div>
            </div>
          )}

          <div className="skeuo-toggle-row interactive" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('equalizer')}>
            <div className="row-info">
              <SlidersHorizontal size={20} className="metal-icon" />
              <div>
                <div className="embossed-text sm">Equaliser</div>
                <div className="engraved-text xs">Custom</div>
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
            <button className={`skeuo-toggle ${hiRes ? 'on' : 'off'}`} onClick={handleToggleHiRes}>
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
            <button className={`skeuo-toggle ${gameMode ? 'on' : 'off'}`} onClick={handleToggleGameMode}>
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

      {/* Modal Dialog */}
      <AnimatePresence>
        {conflictDialog && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}
          >
            <motion.div 
              className="skeuo-panel" 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }}
              style={{ width: '85%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle className="metal-icon" size={24} style={{ color: 'var(--accent-red)' }} />
                <div className="embossed-text">Conflict Detected</div>
              </div>
              <div className="engraved-text sm" style={{ lineHeight: '1.5' }}>
                Hi-Res Audio and Gaming Mode cannot be active simultaneously. 
                Activating {conflictDialog === 'hires' ? 'Hi-Res Audio' : 'Gaming Mode'} will disable {conflictDialog === 'hires' ? 'Gaming Mode' : 'Hi-Res Audio'}. Proceed?
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button className="skeuo-btn" onClick={() => setConflictDialog(null)}>Cancel</button>
                <button className="skeuo-btn" onClick={confirmConflict} style={{ color: 'var(--accent-blue)' }}>Proceed</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
