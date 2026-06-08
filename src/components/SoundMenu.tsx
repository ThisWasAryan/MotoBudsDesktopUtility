import { useState } from 'react';
import { useDeviceStore } from '../store/useDeviceStore';
import { Gamepad2, Volume2, Activity, Radio, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SoundMenu = () => {
  const { name, gameMode, setGameMode, volBoost, setVolBoost, hiRes, setHiRes, setCurrentView } = useDeviceStore();
  
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
        className="right-content"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25 }}
      >
        <div className="page-header">
          <h1 className="page-title">Sound</h1>
          <p className="page-subtitle">Audio modes and enhancements</p>
        </div>

        <div className="settings-group">
          {/* Spatial Audio — Only for Moto Buds+ */}
          {name === 'Moto Buds+' && (
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-icon">
                  <Radio size={18} />
                </div>
                <div className="setting-text">
                  <span className="setting-title">Spatial Audio</span>
                  <span className="setting-desc">Immersive three-dimensional audio</span>
                </div>
              </div>
            </div>
          )}

          {/* Hi-Res Mode */}
          <div className="setting-row">
            <div className="setting-info">
              <div className={`setting-icon ${hiRes ? 'accent' : ''}`}>
                <Activity size={18} />
              </div>
              <div className="setting-text">
                <span className="setting-title">Hi-Res Audio</span>
                <span className="setting-desc">LDAC high-resolution codec</span>
              </div>
            </div>
            <button className={`toggle ${hiRes ? 'on' : 'off'}`} onClick={handleToggleHiRes}>
              <div className="toggle-thumb" />
            </button>
          </div>

          {/* Gaming Mode */}
          <div className="setting-row">
            <div className="setting-info">
              <div className={`setting-icon ${gameMode ? 'accent' : ''}`}>
                <Gamepad2 size={18} />
              </div>
              <div className="setting-text">
                <span className="setting-title">Game Mode</span>
                <span className="setting-desc">Minimise audio latency</span>
              </div>
            </div>
            <button className={`toggle ${gameMode ? 'on' : 'off'}`} onClick={handleToggleGameMode}>
              <div className="toggle-thumb" />
            </button>
          </div>

          {/* Volume Booster */}
          <div className="setting-row">
            <div className="setting-info">
              <div className={`setting-icon ${volBoost ? 'accent' : ''}`}>
                <Volume2 size={18} />
              </div>
              <div className="setting-text">
                <span className="setting-title">Volume Boost</span>
                <span className="setting-desc">Increase maximum volume</span>
              </div>
            </div>
            <button className={`toggle ${volBoost ? 'on' : 'off'}`} onClick={() => setVolBoost(!volBoost)}>
              <div className="toggle-thumb" />
            </button>
          </div>

          {/* Equalizer Link */}
          <div className="setting-row interactive" onClick={() => setCurrentView('equalizer')}>
            <div className="setting-info">
              <div className="setting-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /></svg>
              </div>
              <div className="setting-text">
                <span className="setting-title">Equalizer</span>
                <span className="setting-desc">Custom 10-band tuning</span>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--text-3)' }}><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        </div>
      </motion.div>

      {/* ─── Conflict Dialog ─── */}
      <AnimatePresence>
        {conflictDialog && (
          <motion.div 
            className="dialog-overlay"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="dialog-card"
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="dialog-header">
                <div className="dialog-icon">
                  <AlertTriangle size={20} />
                </div>
                <span className="dialog-title">Mode Conflict</span>
              </div>
              <p className="dialog-body">
                Hi-Res Audio and Game Mode cannot be active simultaneously. 
                Enabling {conflictDialog === 'hires' ? 'Hi-Res Audio' : 'Game Mode'} will 
                disable {conflictDialog === 'hires' ? 'Game Mode' : 'Hi-Res Audio'}.
              </p>
              <div className="dialog-actions">
                <button className="dialog-btn dialog-btn-secondary" onClick={() => setConflictDialog(null)}>Cancel</button>
                <button className="dialog-btn dialog-btn-primary" onClick={confirmConflict}>Proceed</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
