import { useState, useEffect, useRef, useCallback } from 'react';
import { useDeviceStore } from '../store/useDeviceStore';
import { motion } from 'framer-motion';

const FREQS = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];
const TRACK_HEIGHT = 200;
const MIN_GAIN = -3;
const MAX_GAIN = 3;

export const Equalizer = () => {
  const { eqBands, setEqBands } = useDeviceStore();
  const [localBands, setLocalBands] = useState<number[]>(eqBands);

  useEffect(() => {
    setLocalBands(eqBands);
  }, [eqBands]);

  const commitBands = useCallback(() => {
    setEqBands(localBands);
  }, [localBands, setEqBands]);

  const resetBands = () => {
    const flat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    setLocalBands(flat);
    setEqBands(flat);
  };

  return (
    <motion.div 
      className="right-content"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      <div className="eq-container">
        <div className="eq-header">
          <div>
            <h1 className="page-title">Equalizer</h1>
            <p className="page-subtitle">10-band graphic equalizer</p>
          </div>
          <button className="eq-reset-btn" onClick={resetBands}>Reset</button>
        </div>

        <div className="eq-panel">
          <div className="eq-sliders">
            {FREQS.map((freq, i) => (
              <EqBand 
                key={i}
                freq={freq}
                gain={localBands[i]}
                onChange={(val) => {
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
