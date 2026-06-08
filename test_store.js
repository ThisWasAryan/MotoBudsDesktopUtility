const { create } = require('zustand');

// Dummy store logic
let battery = { left: null, right: null, case: null, chargingL: false, chargingR: false, chargingCase: false, inCaseL: false, inCaseR: false };

function update(payload) {
  const rawLeft = payload[0];
  const rawRight = payload[1];
  const rawCase = payload[2];
  
  battery = {
    ...battery,
    left: (rawLeft & 0x7F) > 100 ? null : (rawLeft & 0x7F),
    right: (rawRight & 0x7F) > 100 ? null : (rawRight & 0x7F),
    case: (rawCase & 0x7F) > 100 ? null : (rawCase & 0x7F),
    chargingL: (rawLeft & 0x80) > 0,
    chargingR: (rawRight & 0x80) > 0,
    chargingCase: (rawCase & 0x80) > 0,
  };
}

update([0xE4, 0xDA, 0xD0]); // 100+128, 90+128, 80+128
console.log(battery);
