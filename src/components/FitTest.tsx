import { useDeviceStore } from '../store/useDeviceStore';
import { Play, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const FitTest = () => {
  const { physicallyInEarL, physicallyInEarR, fitTestRunning, fitTestResultL, fitTestResultR } = useDeviceStore();

  const startTest = async () => {
    if (!physicallyInEarL || !physicallyInEarR) return;
    
    useDeviceStore.setState({ fitTestRunning: true, fitTestResultL: null, fitTestResultR: null });

    if (window.api && window.api.motoCommand) {
      await window.api.motoCommand({ op: 'fit', enabled: 1 });
    }
  };

  const hasResults = fitTestResultL !== null && fitTestResultR !== null;
  const bothPass = fitTestResultL === 1 && fitTestResultR === 1;

  return (
    <motion.div 
      className="right-content"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      <div className="page-header">
        <h1 className="page-title">Fit Test</h1>
        <p className="page-subtitle">Verify your earbud seal quality</p>
      </div>

      <div className="fit-test-container">
        {/* ─── Main Visual ─── */}
        {fitTestRunning || !hasResults ? (
          <div className={`fit-test-orb ${fitTestRunning ? 'testing' : ''}`}>
            {fitTestRunning ? (
              <Loader2 size={48} className="spinner" style={{ color: 'var(--accent)' }} />
            ) : (
              <Play size={48} style={{ color: 'var(--text-3)', marginLeft: 6 }} />
            )}
          </div>
        ) : (
          <div className="fit-test-results">
            <div className={`fit-result-card ${fitTestResultL === 1 ? 'pass' : 'fail'}`}>
              {fitTestResultL === 1 
                ? <CheckCircle2 size={32} className="fit-result-icon" style={{ color: 'var(--success)' }} />
                : <XCircle size={32} className="fit-result-icon" style={{ color: 'var(--danger)' }} />
              }
              <span className="fit-result-label">Left</span>
              <span className={`fit-result-status ${fitTestResultL === 1 ? 'pass' : 'fail'}`}>
                {fitTestResultL === 1 ? 'Good Fit' : 'Adjust'}
              </span>
            </div>
            <div className={`fit-result-card ${fitTestResultR === 1 ? 'pass' : 'fail'}`}>
              {fitTestResultR === 1 
                ? <CheckCircle2 size={32} className="fit-result-icon" style={{ color: 'var(--success)' }} />
                : <XCircle size={32} className="fit-result-icon" style={{ color: 'var(--danger)' }} />
              }
              <span className="fit-result-label">Right</span>
              <span className={`fit-result-status ${fitTestResultR === 1 ? 'pass' : 'fail'}`}>
                {fitTestResultR === 1 ? 'Good Fit' : 'Adjust'}
              </span>
            </div>
          </div>
        )}

        {/* ─── Info Text ─── */}
        <div className="fit-test-info">
          {fitTestRunning ? (
            <>
              <h3>Testing seal...</h3>
              <p>Remain quiet and keep still while the test completes.</p>
            </>
          ) : hasResults ? (
            <>
              <h3>{bothPass ? 'Excellent seal' : 
                   fitTestResultL !== 1 && fitTestResultR !== 1 ? 'Adjust both earbuds' :
                   fitTestResultL !== 1 ? 'Adjust left earbud' : 'Adjust right earbud'}</h3>
              <p>{bothPass 
                ? 'Your earbuds are providing an optimal seal for best audio performance.'
                : 'Try adjusting the earbuds or using a different tip size for a better seal.'}</p>
            </>
          ) : (
            <>
              <h3>Test your earbud fit</h3>
              <p>A good seal improves noise cancellation and audio quality significantly.</p>
            </>
          )}
        </div>

        {/* ─── Warning ─── */}
        {(!physicallyInEarL || !physicallyInEarR) && !fitTestRunning && !hasResults && (
          <div className="fit-test-warning">
            <AlertCircle size={16} />
            <span>Insert both earbuds to start the test</span>
          </div>
        )}

        {/* ─── Start Button ─── */}
        <button 
          className="fit-start-btn"
          onClick={startTest}
          disabled={fitTestRunning || !physicallyInEarL || !physicallyInEarR}
        >
          {fitTestRunning ? 'Testing...' : hasResults ? 'Test Again' : 'Start Test'}
        </button>
      </div>
    </motion.div>
  );
};
