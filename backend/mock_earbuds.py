import socket
import struct
import binascii
import sys

HEAD = b"HEAD"
TAIL = b"TAIL"

def create_packet(opcode: int, payload: bytes) -> bytes:
    packet = bytearray()
    packet.extend(HEAD)
    total_len = 8 + len(payload)
    packet.extend(total_len.to_bytes(2, byteorder='little'))
    packet.extend(opcode.to_bytes(2, byteorder='big'))
    packet.append(32) # Response type
    packet.append(1)  # Success result
    packet.extend(len(payload).to_bytes(2, byteorder='little'))
    packet.extend(int(0).to_bytes(2, byteorder='little')) 
    packet.extend(payload)
    crc = binascii.crc32(packet) & 0xFFFFFFFF
    packet.extend(struct.pack('<I', crc))
    packet.extend(TAIL)
    return bytes(packet)

def main():
    HOST = '127.0.0.1'
    PORT = 5001
    
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind((HOST, PORT))
    server.listen(1)
    
    print(f"Mock Earbuds listening on {HOST}:{PORT}")
    
    conn, addr = server.accept()
    print(f"Connected by {addr}")
    
    try:
        while True:
            data = conn.recv(1024)
            if not data:
                break
            
            # Simple mock logic
            # Find opcode
            if len(data) >= 14:
                opcode = (data[6] << 8) | data[7]
                print(f"Received opcode: {hex(opcode)}")
                
                if opcode == 0x0000:
                    conn.send(create_packet(0x0000, b"XT2441-1_Mock"))
                elif opcode == 0x000B:
                    conn.send(create_packet(0x000B, b"\x01"))
                elif opcode == 0x0010:
                    conn.send(create_packet(0x0010, b""))
                elif opcode == 0x0005:
                    # IMPORTANT: First send Empty ACK
                    conn.send(create_packet(0x0005, b""))
                    # Then immediately send Battery Notification (0x0009) with Battery levels
                    # Left 100%, Right 90%, Case 80% (Bit 7 is charging)
                    # 100 = 0x64, 90 = 0x5A, 80 = 0x50
                    conn.send(create_packet(0x0009, bytes([0x64, 0x5A, 0x50])))
                elif opcode == 0x0004:
                    conn.send(create_packet(0x0004, b"MockHW"))
                elif opcode == 0x0201:
                    conn.send(create_packet(0x0204, bytes([1, 1])))
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()
        server.close()

if __name__ == "__main__":
    main()
