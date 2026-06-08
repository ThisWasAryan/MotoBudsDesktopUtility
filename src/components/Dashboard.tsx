import { useDeviceStore } from '../store/useDeviceStore';
import { Battery, Zap, Gamepad2, Volume2 } from 'lucide-react';
import '../index.css';

const Dashboard = () => {
  const { name, modelId, battery, features, hiRes, gameMode, setHiRes, setGameMode } = useDeviceStore();

  const getDeviceImage = () => {
    // Dynamic asset mapping
    const fallback = '../../assets/devices/moto_buds.png';
    if (!modelId) return fallback;
    if (modelId === 'XT2441-1') return '../../assets/devices/moto_buds_plus.png';
    if (modelId === 'XT2443-1') return '../../assets/devices/moto_buds.png';
    return fallback;
  };

  const BatteryIndicator = ({ label, value, charging }: { label: string, value: number | null, charging: boolean }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative' }}>
        <Battery size={32} color={value !== null && value > 20 ? 'var(--success)' : 'var(--danger)'} />
        {charging && <Zap size={16} color="#FFD60A" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value !== null ? `${value}%` : '--'}</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>{name || 'Moto Buds'}</h1>
          <p style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span>
            Connected • {modelId}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Device Image Panel */}
        <div className="panel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '48px' }}>
          <img 
            src={getDeviceImage()} 
            alt={name || 'Device'} 
            className="device-image" 
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Battery Panel */}
          <div className="panel" style={{ display: 'flex', justifyContent: 'space-around', padding: '32px' }}>
            <BatteryIndicator label="Left" value={battery.left} charging={battery.charging} />
            <BatteryIndicator label="Case" value={battery.case} charging={battery.charging} />
            <BatteryIndicator label="Right" value={battery.right} charging={battery.charging} />
          </div>

          {/* Quick Toggles */}
          <div className="panel">
            <h2 style={{ fontSize: '16px', marginBottom: '24px' }}>Quick Controls</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Feature 109: Hi-Res */}
              {features.includes(109) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', background: 'var(--bg-base)', borderRadius: '8px' }}>
                      <Volume2 size={20} color="var(--accent)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Hi-Res Audio (LDAC)</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Premium audio quality</div>
                    </div>
                  </div>
                  <div 
                    className="toggle interactive" 
                    data-on={hiRes} 
                    onClick={() => setHiRes(!hiRes)}
                  >
                    <div className="toggle-knob"></div>
                  </div>
                </div>
              )}

              {/* Feature 110: Game Mode */}
              {features.includes(110) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', background: 'var(--bg-base)', borderRadius: '8px' }}>
                      <Gamepad2 size={20} color="var(--accent)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Game Mode</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Low latency audio</div>
                    </div>
                  </div>
                  <div 
                    className="toggle interactive" 
                    data-on={gameMode} 
                    onClick={() => setGameMode(!gameMode)}
                  >
                    <div className="toggle-knob"></div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
