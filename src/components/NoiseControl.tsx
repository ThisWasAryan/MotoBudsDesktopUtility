import React from 'react';
import { useDeviceStore } from '../store/useDeviceStore';
import { Ear, RadioReceiver, VolumeX } from 'lucide-react';
import '../index.css';

const NoiseControl = () => {
  const { ancMode, setAncMode, features } = useDeviceStore();

  if (!features.includes(104)) {
    return (
      <div className="panel empty-state">
        <VolumeX size={48} color="var(--text-secondary)" style={{ marginBottom: '16px' }} />
        <h2>Noise Control Unavailable</h2>
        <p>This device does not support Active Noise Cancellation.</p>
      </div>
    );
  }

  const ModeCard = ({ 
    icon, title, description, active, onClick 
  }: { 
    icon: React.ReactNode, title: string, description: string, active: boolean, onClick: () => void 
  }) => (
    <div 
      className="panel interactive" 
      onClick={onClick}
      style={{ 
        cursor: 'pointer', 
        borderColor: active ? 'var(--accent)' : 'var(--border)',
        boxShadow: active ? '0 0 0 1px var(--accent), var(--shadow-sm)' : 'var(--shadow-sm)',
        background: active ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        gap: '24px'
      }}
    >
      <div style={{ 
        width: '48px', height: '48px', borderRadius: '50%', 
        background: active ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
        color: active ? '#000' : 'var(--text-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>{title}</h3>
        <p style={{ fontSize: '14px', margin: 0 }}>{description}</p>
      </div>
    </div>
  );

  return (
    <div>
      <h1 style={{ marginBottom: '32px' }}>Noise Control</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <ModeCard 
          icon={<VolumeX size={24} />}
          title="Active Noise Cancellation"
          description="Blocks out background noise for an immersive listening experience."
          active={ancMode === 1}
          onClick={() => setAncMode(1, 1)} // Default ANC strength
        />
        
        <ModeCard 
          icon={<Ear size={24} />}
          title="Transparency Mode"
          description="Lets outside sound in so you can hear your surroundings."
          active={ancMode === 2}
          onClick={() => setAncMode(2, 0)} // Default Transparency
        />
        
        <ModeCard 
          icon={<RadioReceiver size={24} />}
          title="Off"
          description="Disables both noise cancellation and transparency modes."
          active={ancMode === 0}
          onClick={() => setAncMode(0, 0)}
        />
      </div>

      {ancMode === 1 && (
        <div className="panel" style={{ marginTop: '24px' }}>
          <h3>ANC Intensity</h3>
          <p style={{ marginBottom: '16px', fontSize: '14px' }}>Adjust the strength of noise cancellation.</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Hardcoded based on reversed protocol: 1 = Max, 2 = Medium, 3 = Adaptive (simplified here) */}
            <button className="btn interactive" onClick={() => setAncMode(1, 1)}>Strong</button>
            <button className="btn interactive" onClick={() => setAncMode(1, 2)}>Medium</button>
            <button className="btn interactive" onClick={() => setAncMode(1, 3)}>Light</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoiseControl;
