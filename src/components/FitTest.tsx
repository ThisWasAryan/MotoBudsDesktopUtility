import { useDeviceStore } from '../store/useDeviceStore';
import { Play, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import leftBud from '../assets/left_bud.png';
import rightBud from '../assets/right_bud.png';
import './FitTest.css';

export const FitTest = () => {
  const { physicallyInEarL, physicallyInEarR, fitTestRunning, fitTestResultL, fitTestResultR } = useDeviceStore();

  const startTest = async () => {
    if (!physicallyInEarL || !physicallyInEarR) return;
    
    useDeviceStore.setState({ fitTestRunning: true, fitTestResultL: null, fitTestResultR: null });

    if (window.api && window.api.motoCommand) {
      await window.api.motoCommand({ op: 'fit', enabled: 1 });
    }
  };

  const dismissResults = () => {
    useDeviceStore.setState({ fitTestResultL: null, fitTestResultR: null });
  };

  const hasResults = fitTestResultL !== null && fitTestResultR !== null;
  const bothPass = fitTestResultL === 1 && fitTestResultR === 1;
  const leftPass = fitTestResultL === 1;
  const rightPass = fitTestResultR === 1;

  /* Contextual advice text */
  const getAdviceText = () => {
    if (bothPass) return 'Your earbuds are providing an optimal seal for the best audio experience.';
    if (!leftPass && !rightPass) return 'Adjust both earbuds or try a different ear tip size for a better seal.';
    if (!leftPass) return 'Adjust the left earbud or try another ear tip size.';
    return 'Adjust the right earbud or try another ear tip size.';
  };

  return (
    <motion.div 
      className="right-content ft-container"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      <div className="page-header">
        <h1 className="page-title">Fit test</h1>
        <p className="page-subtitle">Ensure excellent audio quality and noise control by making sure your Moto Buds fit properly</p>
      </div>

      <div className="fit-test-content-area">
        <AnimatePresence mode="wait">
          {/* ─── RESULTS SCREEN ─── */}
          {hasResults && !fitTestRunning && (
            <motion.div
              key="results"
              className="ft-results-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Floating Earbuds */}
              <div className="ft-buds-display">
                {/* Left Bud */}
                <div className="ft-bud-wrapper">
                  <motion.img 
                    src={leftBud} 
                    alt="Left earbud" 
                    className="ft-bud-image ft-left-bud-image"
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className={`ft-ellipse ft-ellipse-left ${leftPass ? 'pass' : 'fail'}`}>
                    <div className="ft-ellipse-badge">L</div>
                  </div>
                </div>

                {/* Right Bud */}
                <div className="ft-bud-wrapper">
                  <motion.img 
                    src={rightBud} 
                    alt="Right earbud" 
                    className="ft-bud-image ft-right-bud-image"
                    animate={{ y: [5, -5, 5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className={`ft-ellipse ft-ellipse-right ${rightPass ? 'pass' : 'fail'}`}>
                    <div className="ft-ellipse-badge">R</div>
                  </div>
                </div>
              </div>

              {/* Advice Text */}
              <p className="ft-advice-text">{getAdviceText()}</p>

              {/* Actions */}
              <div className="ft-action-buttons">
                <button
                  className="ft-btn-primary"
                  onClick={startTest}
                  disabled={!physicallyInEarL || !physicallyInEarR}
                >
                  Try again
                </button>
                <button
                  className="ft-btn-secondary"
                  onClick={dismissResults}
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── TESTING SCREEN ─── */}
          {fitTestRunning && !hasResults && (
            <motion.div
              key="testing"
              className="ft-center-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Loader2 size={48} className="spinner ft-icon" />
              <div className="ft-text-block">
                <h3>Testing seal…</h3>
                <p>Remain quiet and keep still while the test completes.</p>
              </div>
            </motion.div>
          )}

          {/* ─── START SCREEN ─── */}
          {!fitTestRunning && !hasResults && (
            <motion.div
              key="start"
              className="ft-center-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Play size={48} className="ft-icon" />
              <div className="ft-text-block">
                <h3>Test your earbud fit</h3>
                <p>A good seal improves noise cancellation and audio quality significantly.</p>
              </div>

              {(!physicallyInEarL || !physicallyInEarR) && (
                <div className="fit-test-warning">
                  <AlertCircle size={16} />
                  <span>Insert both earbuds to start the test</span>
                </div>
              )}

              <button 
                className="ft-btn-primary"
                onClick={startTest}
                disabled={fitTestRunning || !physicallyInEarL || !physicallyInEarR}
              >
                Start Test
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
