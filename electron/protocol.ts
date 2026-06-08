export interface PDU {
  opcode: number;
  type: number;
  seq: number;
  payload: number[];
}

// Simple CRC32 implementation for framing (as typical in such protocols)
function crc32(buffer: Buffer, length: number): number {
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

export function buildPDU(opcode: number, type: number, seq: number, payload: number[]): Buffer {
  const payloadLen = payload.length;
  // HEAD (2) + Length (2) + Opcode (2) + Type (1) + Result/Reserved (1) + Seq (2) + Payload + CRC (4) + TAIL (2)
  const bufferLen = 2 + 2 + 2 + 1 + 1 + 2 + payloadLen + 4 + 2;
  const buf = Buffer.alloc(bufferLen);
  
  // HEAD: 0xAA 0x55
  buf.writeUInt8(0xAA, 0);
  buf.writeUInt8(0x55, 1);
  
  // Length (Little Endian)
  buf.writeUInt16LE(payloadLen + 8, 2); // Payload + header minus magic bytes
  
  // Opcode
  buf.writeUInt16LE(opcode, 4);
  
  // Type
  buf.writeUInt8(type, 6);
  
  // Result
  buf.writeUInt8(0, 7);
  
  // Seq
  buf.writeUInt16LE(seq, 8);
  
  // Payload
  for (let i = 0; i < payloadLen; i++) {
    buf.writeUInt8(payload[i], 10 + i);
  }
  
  // Calculate CRC over everything except HEAD and TAIL/CRC fields
  const crcTarget = buf.subarray(2, 10 + payloadLen);
  const crc = crc32(crcTarget, crcTarget.length);
  buf.writeUInt32LE(crc, 10 + payloadLen);
  
  // TAIL: 0x55 0xAA
  buf.writeUInt8(0x55, 10 + payloadLen + 4);
  buf.writeUInt8(0xAA, 10 + payloadLen + 5);
  
  return buf;
}

export function parsePDU(buffer: Buffer): PDU | null {
  // Check magic HEAD
  if (buffer.length < 16) return null; // Minimum size
  if (buffer[0] !== 0xAA || buffer[1] !== 0x55) return null;
  
  const length = buffer.readUInt16LE(2);
  const opcode = buffer.readUInt16LE(4);
  const type = buffer.readUInt8(6);
  const seq = buffer.readUInt16LE(8);
  
  const payloadLen = length - 8;
  const payload = [];
  for(let i = 0; i < payloadLen; i++) {
    payload.push(buffer[10 + i]);
  }
  
  return { opcode, type, seq, payload };
}
