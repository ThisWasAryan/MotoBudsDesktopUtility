export interface PDU {
  opcode: number;
  type: number;
  seq: number;
  payload: number[];
}

// Simple CRC32 implementation for framing
function crc32(buffer: Uint8Array, length: number): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < length; i++) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j++) {
      if ((crc & 1) !== 0) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc >>>= 1;
      }
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

export function buildPDU(opcode: number, type: number, seq: number, payload: number[]): Uint8Array {
  const payloadLen = payload.length;
  const bufferLen = 2 + 2 + 2 + 1 + 1 + 2 + payloadLen + 4 + 2;
  const buf = new Uint8Array(bufferLen);
  const dataView = new DataView(buf.buffer);
  
  // HEAD: 0xAA 0x55
  buf[0] = 0xAA;
  buf[1] = 0x55;
  
  // Length (Little Endian)
  dataView.setUint16(2, payloadLen + 8, true);
  
  // Opcode
  dataView.setUint16(4, opcode, true);
  
  // Type
  buf[6] = type;
  
  // Result
  buf[7] = 0;
  
  // Seq
  dataView.setUint16(8, seq, true);
  
  // Payload
  for (let i = 0; i < payloadLen; i++) {
    buf[10 + i] = payload[i];
  }
  
  // Calculate CRC
  const crcTarget = buf.subarray(2, 10 + payloadLen);
  const crc = crc32(crcTarget, crcTarget.length);
  dataView.setUint32(10 + payloadLen, crc, true);
  
  // TAIL: 0x55 0xAA
  buf[10 + payloadLen + 4] = 0x55;
  buf[10 + payloadLen + 5] = 0xAA;
  
  return buf;
}

export function parsePDU(buffer: Uint8Array): PDU | null {
  if (buffer.length < 16) return null;
  if (buffer[0] !== 0xAA || buffer[1] !== 0x55) return null;
  
  const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const length = dataView.getUint16(2, true);
  const opcode = dataView.getUint16(4, true);
  const type = buffer[6];
  const seq = dataView.getUint16(8, true);
  
  const payloadLen = length - 8;
  const payload = [];
  for(let i = 0; i < payloadLen; i++) {
    payload.push(buffer[10 + i]);
  }
  
  return { opcode, type, seq, payload };
}
