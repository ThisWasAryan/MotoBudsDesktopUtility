import { useDeviceStore } from '../store/useDeviceStore';
import { Headphones, BatteryCharging, ChevronRight, SlidersHorizontal, Settings2, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export const MainDashboard = () => {
  const { name, modelId, battery, ancMode, setAncMode, physicallyInEarL, physicallyInEarR, setCurrentView, hiRes, setHiRes } = useDeviceStore();

  const isCaseVisible = battery.inCaseL || battery.inCaseR;

  return (
    <motion.div 
      className="hero-container"
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 50, opacity: 0 }}
    >
      {/* Top Header */}
      <div className="hero-header">
        <div className="device-id-badge">
          <div className="status-led active"></div>
          <span className="embossed-text sm">{name || modelId || 'Moto Buds'}</span>
        </div>
      </div>

      {/* Main Display / Device Art */}
      <div className="hero-art">
         <div className="skeuo-device-plate">
            <Headphones size={80} className="metal-icon lg" />
         </div>
      </div>

      {/* Battery Dashboard */}
      <div className="skeuo-panel battery-panel" style={{ height: 'auto', padding: '16px 24px' }}>
         <div className="battery-pod">
           <span className="engraved-text xs">L</span>
           <div className="skeuo-battery-bar">
             <div className="fill" style={{ height: `${battery.left || 0}%`, backgroundColor: (battery.left || 0) < 20 ? '#ff4d4f' : '#52c41a' }}></div>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '20px' }}>
             {battery.inCaseL && (battery.left || 0) < 100 && <BatteryCharging size={12} className="metal-icon xs" />}
             <span className="embossed-text">{battery.left !== null ? `${battery.left}%` : '--'}</span>
           </div>
         </div>

         {isCaseVisible && (
           <div className="battery-pod case">
             <span className="engraved-text xs">CASE</span>
             <div className="skeuo-battery-bar case-bar">
               <div className="fill" style={{ height: `${battery.case || 0}%`, backgroundColor: '#1890ff' }}></div>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '20px' }}>
               {battery.chargingCase && <BatteryCharging size={12} className="metal-icon xs" />}
               <span className="embossed-text">{battery.case !== null ? `${battery.case}%` : '--'}</span>
             </div>
           </div>
         )}

         <div className="battery-pod">
           <span className="engraved-text xs">R</span>
           <div className="skeuo-battery-bar">
             <div className="fill" style={{ height: `${battery.right || 0}%`, backgroundColor: (battery.right || 0) < 20 ? '#ff4d4f' : '#52c41a' }}></div>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '20px' }}>
             {battery.inCaseR && (battery.right || 0) < 100 && <BatteryCharging size={12} className="metal-icon xs" />}
             <span className="embossed-text">{battery.right !== null ? `${battery.right}%` : '--'}</span>
           </div>
         </div>
      </div>

      {/* ANC Slider Hardware Switch */}
      <div className="skeuo-panel anc-panel" style={{ position: 'relative' }}>
         <h3 className="engraved-text sm">NOISE CONTROL</h3>
         
         {(!physicallyInEarL || !physicallyInEarR) && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(30,30,30,0.6)', backdropFilter: 'blur(2px)', zIndex: 20, borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="embossed-text sm" style={{ color: '#ff4d4f' }}>Make sure both earbuds are inserted</span>
            </div>
         )}

         <div className="hardware-slider-track">
            <div className={`hardware-slider-thumb pos-${ancMode}`}></div>
            <div className="slider-labels">
               <button className={`label-btn ${ancMode === 0 ? 'active' : ''}`} onClick={() => setAncMode(0, 0)}>Off</button>
               <button className={`label-btn ${ancMode === 2 ? 'active' : ''}`} onClick={() => setAncMode(2, 0)}>Transp.</button>
               <button className={`label-btn ${ancMode === 1 ? 'active' : ''}`} onClick={() => setAncMode(1, 1)}>ANC</button>
            </div>
         </div>
      </div>

      {/* Menu Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        
        <div className="skeuo-panel" style={{ margin: 0, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div className="skeuo-orb" style={{ width: 40, height: 40, margin: 0 }}>
               <Activity size={20} className="metal-icon" />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column' }}>
               <span className="embossed-text sm">Hi-res mode</span>
               <span className="engraved-text xs">Play audio in high resolution</span>
             </div>
           </div>
           <button className={`skeuo-toggle ${hiRes ? 'on' : 'off'}`} onClick={() => setHiRes(!hiRes)}>
             <div className="thumb"></div>
           </button>
        </div>

        <div className="skeuo-panel interactive" style={{ margin: 0, padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setCurrentView('sound')}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div className="skeuo-orb" style={{ width: 40, height: 40, margin: 0 }}>
               <SlidersHorizontal size={20} className="metal-icon" />
             </div>
             <span className="embossed-text">Sound</span>
           </div>
           <ChevronRight size={20} className="metal-icon" />
        </div>

        <div className="skeuo-panel interactive" style={{ margin: 0, padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setCurrentView('more')}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div className="skeuo-orb" style={{ width: 40, height: 40, margin: 0 }}>
               <Settings2 size={20} className="metal-icon" />
             </div>
             <span className="embossed-text sm">More</span>
           </div>
           <ChevronRight size={20} className="metal-icon" />
        </div>

      </div>
    </motion.div>
  );
};
