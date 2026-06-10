import { motion } from 'framer-motion';
import { useDeviceStore } from '../store/useDeviceStore';
import { MousePointerClick, Ear } from 'lucide-react';

const gestureOptions = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Play / Pause' },
  { value: 2, label: 'Previous Track' },
  { value: 3, label: 'Next Track' },
  { value: 4, label: 'Voice Assistant' },
  { value: 10, label: 'Noise Control' }
];

export const Gestures = () => {
  const { gestures, setGestureConfig } = useDeviceStore();

  const handleGestureChange = (earbud: number, gestureType: number, func: number) => {
    setGestureConfig(earbud, gestureType, func);
  };

  const renderDropdown = (earbud: number, gestureType: number, label: string) => {
    const isLeft = earbud === 0;
    const currentGestures = isLeft ? gestures.left : gestures.right;
    const currentVal = currentGestures[gestureType];

    const hasVoiceAssistant = Object.entries(currentGestures).some(([g, v]) => parseInt(g) !== gestureType && v === 4);
    const hasNoiseControl = Object.entries(currentGestures).some(([g, v]) => parseInt(g) !== gestureType && v === 10);

    const isOptionDisabled = (val: number) => {
      if (val === 10 && hasVoiceAssistant) return true;
      if (val === 4 && hasNoiseControl) return true;
      return false;
    };
    
    return (
      <div className="gesture-row" key={`${earbud}-${gestureType}`}>
        <div className="gesture-label-group">
          <MousePointerClick size={16} className="gesture-icon" />
          <span className="gesture-name">{label}</span>
        </div>
        <select 
          className="gesture-select"
          value={currentVal !== undefined ? currentVal : 0}
          onChange={(e) => handleGestureChange(earbud, gestureType, parseInt(e.target.value))}
        >
          {gestureOptions.map(opt => (
            <option key={opt.value} value={opt.value} disabled={isOptionDisabled(opt.value)}>
              {opt.label} {isOptionDisabled(opt.value) ? '(Conflicts)' : ''}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <motion.div 
      className="right-content panel-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <div className="panel-header">
        <h2 className="panel-title">Gestures</h2>
        <p className="panel-subtitle">Customize tap actions for your earbuds.</p>
      </div>

      <div className="gestures-content">
        <div className="gesture-card">
          <div className="gesture-card-header">
            <Ear size={20} className="ear-icon" />
            <h3 className="gesture-card-title">Left Earbud</h3>
          </div>
          <div className="gesture-card-body">
            {renderDropdown(0, 1, 'Double Tap')}
            {renderDropdown(0, 2, 'Triple Tap')}
            {renderDropdown(0, 3, 'Press and Hold')}
          </div>
        </div>

        <div className="gesture-card">
          <div className="gesture-card-header">
            <Ear size={20} className="ear-icon" />
            <h3 className="gesture-card-title">Right Earbud</h3>
          </div>
          <div className="gesture-card-body">
            {renderDropdown(1, 1, 'Double Tap')}
            {renderDropdown(1, 2, 'Triple Tap')}
            {renderDropdown(1, 3, 'Press and Hold')}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
