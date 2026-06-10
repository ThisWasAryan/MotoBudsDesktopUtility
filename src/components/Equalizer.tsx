import { useState, useEffect, useRef, useCallback } from 'react';
import { useDeviceStore } from '../store/useDeviceStore';
import { motion } from 'framer-motion';

const FREQS = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];
const TRACK_HEIGHT = 200;
const MIN_GAIN = -3;
const MAX_GAIN = 3;

export const PRESETS: Record<string, number[]> = {
  'Flat': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [3.0, 2.5, 1.5, 0.5, 0, 0, 0, 0, 0, 0],
  'Brilliant Treble': [0, 0, 0, 0, 0, 0, 0.5, 1.5, 2.5, 3.0],
  'Classical': [1.5, 1.0, 0.5, 0, -0.5, 0, 0.5, 1.0, 1.5, 2.0],
  'Electronic': [2.5, 2.0, 1.0, 0, -1.0, 0, 1.0, 2.0, 2.5, 3.0],
  'Acoustic': [1.0, 1.5, 0.5, 0, 0, 0.5, 1.0, 1.5, 1.0, 0.5],
  'Vocal': [-1.0, -0.5, 0, 1.0, 2.0, 2.5, 2.0, 1.0, 0, -1.0],
};

export const Equalizer = () => {
  const { eqBands, setEqBands, eqPreset, setEqPreset } = useDeviceStore();
  const [localBands, setLocalBands] = useState<number[]>(eqBands);

  useEffect(() => {
    setLocalBands(eqBands);
  }, [eqBands]);

  const commitBands = useCallback(() => {
    setEqBands(localBands);
  }, [localBands, setEqBands]);

  const handlePresetClick = (presetName: string) => {
    setEqPreset(presetName);
    if (presetName !== 'Custom EQ') {
      const newBands = PRESETS[presetName];
      setLocalBands(newBands);
      setEqBands(newBands);
    }
  };

  const switchToCustom = () => {
    if (eqPreset !== 'Custom EQ') {
      setEqPreset('Custom EQ');
    }
  };

  const resetBands = () => {
    handlePresetClick('Flat');
    setEqPreset('Custom EQ');
  };

  // Macro sliders
  const handleBassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    switchToCustom();
    const val = parseFloat(e.target.value);
    const newBands = [...localBands];
    newBands[0] = val;
    newBands[1] = val * 0.8;
    newBands[2] = val * 0.5;
    newBands[3] = val * 0.2;
    setLocalBands(newBands);
  };

  const handleTrebleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    switchToCustom();
    const val = parseFloat(e.target.value);
    const newBands = [...localBands];
    newBands[6] = val * 0.2;
    newBands[7] = val * 0.5;
    newBands[8] = val * 0.8;
    newBands[9] = val;
    setLocalBands(newBands);
  };

  // Compute average macro values for the sliders
  const currentBassMacro = localBands[0] || 0;
  const currentTrebleMacro = localBands[9] || 0;

  return (
    <motion.div 
      className="right-content"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      <div className="eq-container">
        <div className="eq-header" style={{ marginBottom: '16px' }}>
          <div>
            <h1 className="page-title">Equalizer</h1>
            <p className="page-subtitle">Customize your sound profile</p>
          </div>
          <button className="eq-reset-btn" onClick={resetBands}>Reset</button>
        </div>

        {/* Presets List */}
        <div className="eq-presets-scroll" style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '16px',
          marginBottom: '8px',
          scrollbarWidth: 'none'
        }}>
          {['Custom EQ', ...Object.keys(PRESETS)].map(preset => (
            <button
              key={preset}
              onClick={() => handlePresetClick(preset)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: eqPreset === preset ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                backgroundColor: eqPreset === preset ? 'var(--accent-dim)' : 'var(--surface-1)',
                color: eqPreset === preset ? 'var(--accent)' : 'var(--text-1)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: 500,
                boxShadow: eqPreset === preset ? 'var(--shadow-glow)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {preset}
            </button>
          ))}
        </div>

        <div className="eq-panel">
          {/* Macro Sliders for Custom EQ */}
          {eqPreset === 'Custom EQ' && (
            <div style={{
              display: 'flex',
              gap: '24px',
              padding: '24px',
              backgroundColor: 'var(--surface-2)',
              borderRadius: '16px',
              marginBottom: '24px',
              border: '1px solid var(--border)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-2)' }}>Bass</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>{currentBassMacro > 0 ? '+' : ''}{currentBassMacro.toFixed(1)}</span>
                </div>
                <input 
                  type="range" 
                  min="-3" max="3" step="0.1" 
                  value={currentBassMacro}
                  onChange={handleBassChange}
                  onMouseUp={commitBands}
                  onTouchEnd={commitBands}
                  className="macro-slider"
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-2)' }}>Treble</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>{currentTrebleMacro > 0 ? '+' : ''}{currentTrebleMacro.toFixed(1)}</span>
                </div>
                <input 
                  type="range" 
                  min="-3" max="3" step="0.1" 
                  value={currentTrebleMacro}
                  onChange={handleTrebleChange}
                  onMouseUp={commitBands}
                  onTouchEnd={commitBands}
                  className="macro-slider"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          <div className="eq-sliders">
            {FREQS.map((freq, i) => (
              <EqBand 
                key={i}
                freq={freq}
                gain={localBands[i]}
                onChange={(val) => {
                  switchToCustom();
                  const newBands = [...localBands];
                  newBands[i] = val;
                  setLocalBands(newBands);
                }}
                onCommit={commitBands}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Individual EQ Band Slider ─── */
function EqBand({ freq, gain, onChange, onCommit }: { 
  freq: string; gain: number; onChange: (v: number) => void; onCommit: () => void 
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const gainToPercent = (g: number) => ((g - MIN_GAIN) / (MAX_GAIN - MIN_GAIN)) * 100;
  const percentToGain = (p: number) => MIN_GAIN + (p / 100) * (MAX_GAIN - MIN_GAIN);

  const thumbPercent = gainToPercent(gain);
  
  // Fill from center (50%) to current position
  const fillStyle = gain >= 0 
    ? { bottom: '50%', height: `${thumbPercent - 50}%` }
    : { bottom: `${thumbPercent}%`, height: `${50 - thumbPercent}%` };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromEvent(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updateFromEvent(e);
  };

  const handlePointerUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      onCommit();
    }
  };

  const updateFromEvent = (e: React.PointerEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percent = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
    const newGain = Math.round(percentToGain(percent) * 10) / 10;
    onChange(Math.max(MIN_GAIN, Math.min(MAX_GAIN, newGain)));
  };

  return (
    <div className="eq-band">
      <span className="eq-gain-label">
        {gain > 0 ? '+' : ''}{gain.toFixed(1)}
      </span>
      <div 
        className="eq-slider-track"
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ height: `${TRACK_HEIGHT}px` }}
      >
        <div className="eq-slider-fill" style={fillStyle} />
        <div className="eq-slider-thumb" style={{ bottom: `${thumbPercent}%` }} />
      </div>
      <span className="eq-freq-label">{freq}</span>
    </div>
  );
}
