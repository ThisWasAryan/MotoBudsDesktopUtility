import { useDeviceStore } from '../store/useDeviceStore';
import { useState } from 'react';
import { Zap, SlidersHorizontal, Headphones, Settings, Activity, BellRing, Ear, MousePointerClick, CheckCircle2, EarOff, Sun, Target, X, Loader2 } from 'lucide-react';
import budsInCase from '../assets/buds_in_case.png';

export const MainDashboard = () => {
  const { 
    name, battery, ancMode, setAncMode, 
    physicallyInEarL, physicallyInEarR, 
    currentView, setCurrentView,
    hiRes, gameMode, volBoost, reconnectStatus
  } = useDeviceStore();

  const [hoveredMode, setHoveredMode] = useState<number | null>(null);

  const getBatteryClass = (level: number | null) => {
    if (level === null) return '';
    if (level < 10) return 'danger-extreme';
    if (level < 20) return 'danger';
    if (level < 80) return 'warning';
    return 'healthy';
  };

  const renderConnectionStatus = () => {
    switch (reconnectStatus) {
      case 'dropping':
        return (
          <span title="Connection dropping..." style={{ display: 'flex', alignItems: 'center' }}>
            <X size={18} color="var(--danger)" />
          </span>
        );
      case 'reconnecting':
        return (
          <span title="Trying to reconnect" style={{ display: 'flex', alignItems: 'center' }}>
            <Loader2 size={18} color="var(--warning)" className="spinner" />
          </span>
        );
      case 'success':
        return (
          <span title="Reconnected!" style={{ display: 'flex', alignItems: 'center' }} className="blink-green">
            <CheckCircle2 size={18} color="var(--success)" />
          </span>
        );
      default:
        return (
          <span title="Device is trusted" style={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle2 size={18} color="var(--accent)" />
          </span>
        );
    }
  };

  const isCaseVisible = battery.inCaseL || battery.inCaseR;

  return (
    <>
      <div className="device-header">
        <div className="device-info">
          <span className="device-name">{name || 'Moto Buds'}</span>
          {renderConnectionStatus()}
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
              {battery.inCaseL 
                ? <Zap size={14} className="charging-icon" title="Charging" /> 
                : (physicallyInEarL && <Ear size={14} style={{ opacity: 0.6 }} title="In Ear" />)}
            </div>
            <div className="battery-value">
              <span className="type-battery">{battery.left !== null ? battery.left : '--'}</span>
              <span className="battery-percent-sign">%</span>
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
              {battery.inCaseR 
                ? <Zap size={14} className="charging-icon" title="Charging" /> 
                : (physicallyInEarR && <Ear size={14} style={{ opacity: 0.6 }} title="In Ear" />)}
            </div>
            <div className="battery-value">
              <span className="type-battery">{battery.right !== null ? battery.right : '--'}</span>
              <span className="battery-percent-sign">%</span>
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
                {battery.chargingCase && <Zap size={14} className="charging-icon" title="Charging" />}
              </div>
              <div className="battery-value">
                <span className="type-battery">{battery.case !== null ? battery.case : '--'}</span>
                <span className="battery-percent-sign">%</span>
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
        <div className="type-heading anc-label" style={{ marginBottom: '16px' }}>Noise Control</div>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {(!physicallyInEarL || !physicallyInEarR) && (
            <div className="anc-disabled-overlay" style={{ borderRadius: '100px' }}>
              <span className="anc-disabled-text">Insert both earbuds</span>
            </div>
          )}
          
          <div className="anc-pill-container" onMouseLeave={() => setHoveredMode(null)}>
            <div className={`anc-pill-indicator pos-${ancMode}`} />
            
            <button 
              className={`anc-pill-btn ${ancMode === 0 ? 'active' : ''}`} 
              onClick={() => setAncMode(0, 0)}
              onMouseEnter={() => setHoveredMode(0)}
            >
              <EarOff size={20} />
            </button>
            
            <button 
              className={`anc-pill-btn ${ancMode === 2 ? 'active' : ''}`} 
              onClick={() => setAncMode(2, 0)}
              onMouseEnter={() => setHoveredMode(2)}
            >
              <Sun size={20} />
            </button>
            
            <button 
              className={`anc-pill-btn ${ancMode === 1 ? 'active' : ''}`} 
              onClick={() => setAncMode(1, 1)}
              onMouseEnter={() => setHoveredMode(1)}
            >
              <Target size={20} />
            </button>
          </div>
          
          <div className="anc-mode-text">
            {hoveredMode !== null ? (
              hoveredMode === 0 ? 'Off' : hoveredMode === 2 ? 'Transparency' : 'Noise Cancellation'
            ) : (
              (!physicallyInEarL || !physicallyInEarR) ? 'Make sure both earbuds are inserted' : (
                ancMode === 0 ? 'Off' : ancMode === 2 ? 'Transparency' : 'Noise Cancellation'
              )
            )}
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
            className={`nav-item ${currentView === 'gestures' ? 'active' : ''}`} 
            onClick={() => setCurrentView('gestures')}
          >
            <MousePointerClick size={18} className="nav-item-icon" />
            Gestures
          </button>
          <button 
            className={`nav-item ${currentView === 'more' ? 'active' : ''}`} 
            onClick={() => setCurrentView('more')}
          >
            <Settings size={18} className="nav-item-icon" />
            More
          </button>
        </div>
      </div>
    </>
  );
};
