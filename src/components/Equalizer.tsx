import { useState } from 'react';
import { useDeviceStore } from '../store/useDeviceStore';
import '../index.css';

const FREQ_LABELS = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];

const Equalizer = () => {
  const { eqState, setEqState } = useDeviceStore();
  const [bands, setBands] = useState<number[]>(new Array(10).fill(0));

  // In a full implementation, changing a band would re-serialize 
  // the 173-byte Little-Endian Float32 buffer and dispatch to IPC.
  const handleBandChange = (index: number, value: number) => {
    const newBands = [...bands];
    newBands[index] = value;
    setBands(newBands);
    
    // Simulate debounced IPC write here
    // sendCustomEqPayload(newBands);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1>Equalizer</h1>
          <p>Customize your audio profile with a 10-band equalizer.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 600 }}>{eqState ? 'Enabled' : 'Disabled'}</span>
          <div className="toggle interactive" data-on={eqState} onClick={() => setEqState(!eqState)}>
            <div className="toggle-knob"></div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ opacity: eqState ? 1 : 0.5, pointerEvents: eqState ? 'auto' : 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '300px', padding: '24px 0' }}>
          {bands.map((gain, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', gap: '16px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>+{Math.max(0, gain).toFixed(1)}</div>
              
              <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
                {/* Vertical slider hack with CSS transform */}
                <input 
                  type="range" 
                  min="-10" 
                  max="10" 
                  step="0.5" 
                  value={gain} 
                  onChange={(e) => handleBandChange(index, parseFloat(e.target.value))}
                  className="interactive"
                  style={{
                    width: '200px',
                    transform: 'rotate(-90deg)',
                    position: 'absolute'
                  }}
                />
              </div>
              
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{gain < 0 ? gain.toFixed(1) : ''}</div>
              <div style={{ fontWeight: 600, fontSize: '14px', marginTop: '8px' }}>{FREQ_LABELS[index]}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
        <button className="btn interactive" onClick={() => setBands(new Array(10).fill(0))}>Flat</button>
        <button className="btn interactive" onClick={() => setBands([4, 3, 2, 0, -1, -1, 0, 2, 3, 4])}>V-Shape</button>
        <button className="btn interactive" onClick={() => setBands([-2, -1, 0, 1, 2, 3, 2, 1, 0, -1])}>Vocal Focus</button>
      </div>
    </div>
  );
};

export default Equalizer;
