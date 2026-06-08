import { useDeviceStore } from '../store/useDeviceStore';
import { Zap, SlidersHorizontal, Headphones, Settings, Activity } from 'lucide-react';
import budsInCase from '../assets/buds_in_case.png';

export const MainDashboard = () => {
  const { 
    name, battery, ancMode, setAncMode, 
    physicallyInEarL, physicallyInEarR, 
    currentView, setCurrentView,
    hiRes, gameMode, volBoost
  } = useDeviceStore();

  const getBatteryClass = (level: number | null) => {
    if (level === null) return '';
    if (level < 20) return 'danger';
    if (level < 40) return 'warning';
    return 'healthy';
  };

  const isCaseVisible = battery.inCaseL || battery.inCaseR;

  return (
    <>
      {/* ─── Device Header ─── */}
      <div className="device-header">
        <div className="device-info">
          <div className="status-dot" />
          <span className="device-name">{name || 'Moto Buds'}</span>
        </div>
      </div>

      {/* ─── Hero Product Image ─── */}
      <div className="hero-image-container">
        <img src={budsInCase} alt="Moto Buds" className="hero-product-image" />
      </div>

      {/* ─── Battery Section ─── */}
      <div className="battery-section">
        <div className="battery-grid">
          {/* Left Earbud */}
          <div className="battery-card">
            <div className="battery-card-header">
              <span className="type-battery-label">Left</span>
            </div>
            <div className="battery-value">
              <span className="type-battery">{battery.left !== null ? battery.left : '--'}</span>
              <span className="battery-percent-sign">%</span>
              {battery.inCaseL && <Zap size={16} className="charging-icon" style={{ marginLeft: '4px' }} />}
            </div>
            <div className="battery-bar-track">
              <div 
                className={`battery-bar-fill ${getBatteryClass(battery.left)}`} 
                style={{ width: `${battery.left || 0}%` }} 
              />
            </div>
          </div>

          {/* Right Earbud */}
          <div className="battery-card">
            <div className="battery-card-header">
              <span className="type-battery-label">Right</span>
            </div>
            <div className="battery-value">
              <span className="type-battery">{battery.right !== null ? battery.right : '--'}</span>
              <span className="battery-percent-sign">%</span>
              {battery.inCaseR && <Zap size={16} className="charging-icon" style={{ marginLeft: '4px' }} />}
            </div>
            <div className="battery-bar-track">
              <div 
                className={`battery-bar-fill ${getBatteryClass(battery.right)}`} 
                style={{ width: `${battery.right || 0}%` }} 
              />
            </div>
          </div>

          {/* Case */}
          {isCaseVisible && (
            <div className="battery-card">
              <div className="battery-card-header">
                <span className="type-battery-label">Case</span>
              </div>
              <div className="battery-value">
                <span className="type-battery">{battery.case !== null ? battery.case : '--'}</span>
                <span className="battery-percent-sign">%</span>
                {battery.chargingCase && <Zap size={16} className="charging-icon" style={{ marginLeft: '4px' }} />}
              </div>
              <div className="battery-bar-track">
                <div 
                  className={`battery-bar-fill ${getBatteryClass(battery.case)}`} 
                  style={{ width: `${battery.case || 0}%` }} 
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── ANC Control ─── */}
      <div className="anc-section">
        <div className="type-heading anc-label">Noise Control</div>
        <div style={{ position: 'relative' }}>
          {(!physicallyInEarL || !physicallyInEarR) && (
            <div className="anc-disabled-overlay">
              <span className="anc-disabled-text">Insert both earbuds</span>
            </div>
          )}
          <div className="anc-segmented">
            <div className={`anc-segmented-indicator pos-${ancMode}`} />
            <button className={`anc-btn ${ancMode === 0 ? 'active' : ''}`} onClick={() => setAncMode(0, 0)}>Off</button>
            <button className={`anc-btn ${ancMode === 2 ? 'active' : ''}`} onClick={() => setAncMode(2, 0)}>Aware</button>
            <button className={`anc-btn ${ancMode === 1 ? 'active' : ''}`} onClick={() => setAncMode(1, 1)}>ANC</button>
          </div>
        </div>
      </div>

      {/* ─── Active Feature Badges ─── */}
      {(hiRes || gameMode || volBoost) && (
        <div className="status-badges">
          {hiRes && <div className="status-badge"><div className="badge-dot" />Hi-Res</div>}
          {gameMode && <div className="status-badge"><div className="badge-dot" />Game Mode</div>}
          {volBoost && <div className="status-badge"><div className="badge-dot" />Vol Boost</div>}
        </div>
      )}

      {/* ─── Navigation ─── */}
      <div className="nav-section">
        <div className="nav-divider" />
        <div className="nav-list">
          <button 
            className={`nav-item ${currentView === 'sound' ? 'active' : ''}`} 
            onClick={() => setCurrentView('sound')}
          >
            <Activity size={18} className="nav-item-icon" />
            Sound
          </button>
          <button 
            className={`nav-item ${currentView === 'equalizer' ? 'active' : ''}`} 
            onClick={() => setCurrentView('equalizer')}
          >
            <SlidersHorizontal size={18} className="nav-item-icon" />
            Equalizer
          </button>
          <button 
            className={`nav-item ${currentView === 'fit-test' ? 'active' : ''}`} 
            onClick={() => setCurrentView('fit-test')}
          >
            <Headphones size={18} className="nav-item-icon" />
            Fit Test
          </button>
          <button 
            className={`nav-item ${currentView === 'more' ? 'active' : ''}`} 
            onClick={() => setCurrentView('more')}
          >
            <Settings size={18} className="nav-item-icon" />
            Settings
          </button>
        </div>
      </div>
    </>
  );
};
