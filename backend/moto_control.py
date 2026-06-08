import socket
import binascii
import struct
import time
import argparse
import sys
import json

CLASSIC_MAC = "54:84:50:92:78:AE"
RFCOMM_PORT = 16

HEAD = b"HEAD"
TAIL = b"TAIL"

class MotoBudsController:
    def __init__(self, mac_address=CLASSIC_MAC, port=RFCOMM_PORT, output_json=False):
        self.mac_address = mac_address
        self.port = port
        self.sock = None
        self.output_json = output_json
        
    def log(self, msg):
        if not self.output_json:
            print(msg)

    def connect(self):
        self.log(f"[*] Connecting to {self.mac_address} on RFCOMM Port {self.port}...")
        self.sock = socket.socket(socket.AF_BLUETOOTH, socket.SOCK_STREAM, socket.BTPROTO_RFCOMM)
        self.sock.settimeout(3.0)
        try:
            self.sock.connect((self.mac_address, self.port))
            self.log("[+] Connected successfully!")
            self._initialization_handshake()
            return True
        except Exception as e:
            self.log(f"[-] Connection failed: {e}")
            self.sock = None
            return False

    def disconnect(self):
        if self.sock:
            self.sock.close()
            self.sock = None
            self.log("[*] Disconnected.")

    def _create_packet(self, opcode: int, payload: bytes) -> bytes:
        packet = bytearray()
        packet.extend(HEAD)
        
        total_len = 8 + len(payload)
        packet.extend(total_len.to_bytes(2, byteorder='little'))
        
        packet.extend(opcode.to_bytes(2, byteorder='big'))
        packet.append(128)  
        packet.append(0)    
        packet.extend(len(payload).to_bytes(2, byteorder='little'))
        packet.extend(int(0).to_bytes(2, byteorder='little')) 
        
        packet.extend(payload)
        
        crc = binascii.crc32(packet) & 0xFFFFFFFF
        packet.extend(struct.pack('<I', crc))
        
        packet.extend(TAIL)
        return bytes(packet)

    def _send_and_receive(self, opcode: int, payload: bytes, wait_for_response=True):
        if not self.sock:
            self.log("[-] Not connected.")
            return None

        packet = self._create_packet(opcode, payload)
        try:
            self.sock.send(packet)
            if wait_for_response:
                resp = self.sock.recv(1024)
                return resp
            return None
        except socket.timeout:
            self.log(f"[-] Timeout waiting for response to opcode {hex(opcode)}")
            return None
        except Exception as e:
            self.log(f"[-] Error communicating: {e}")
            return None

    def _initialization_handshake(self):
        self.log("[*] Performing initialization handshake...")
        self._send_and_receive(0x0000, b"")
        time.sleep(0.2)
        self._send_and_receive(0x000B, b"\xfc\xff\x05\x00")
        time.sleep(0.2)
        self._send_and_receive(0x0010, b"")
        time.sleep(0.2)

    def read_battery(self):
        self.log("[*] Reading Battery Level...")
        resp = self._send_and_receive(0x0005, b"")
        if resp:
            self.log(f"[+] Raw Battery Response: {resp.hex()}")
        return resp.hex() if resp else None

    def get_hardware_info(self):
        self.log("[*] Reading Hardware Info...")
        resp = self._send_and_receive(0x0004, b"")
        if resp:
            self.log(f"[+] Raw Hardware Info: {resp.hex()}")
        return resp.hex() if resp else None

    def toggle_anc(self, mode: int, sub_mode: int):
        self.log(f"[*] Setting ANC Mode: {mode}, Sub-Mode: {sub_mode}")
        payload = bytes([mode, sub_mode])
        resp = self._send_and_receive(0x0201, payload)
        if resp:
            self.log(f"[+] Response: {resp.hex()}")
        return resp.hex() if resp else None

def main():
    parser = argparse.ArgumentParser(description="Moto Buds Controller")
    parser.add_argument("--battery", action="store_true", help="Read battery levels")
    parser.add_argument("--info", action="store_true", help="Read hardware info")
    parser.add_argument("--anc", type=int, choices=[0, 1, 2], help="Set ANC Mode (0=Off, 1=ANC, 2=Transparency)")
    parser.add_argument("--json", action="store_true", help="Output results in JSON format")
    
    args = parser.parse_args()
    
    if not any([args.battery, args.info, args.anc is not None]):
        parser.print_help()
        sys.exit(1)

    controller = MotoBudsController(output_json=args.json)
    
    results = {"status": "success", "data": {}}
    
    if controller.connect():
        if args.battery:
            res = controller.read_battery()
            results["data"]["battery_raw"] = res
        if args.info:
            res = controller.get_hardware_info()
            results["data"]["hardware_raw"] = res
        if args.anc is not None:
            sub_mode = 1 if args.anc == 1 else 0
            res = controller.toggle_anc(args.anc, sub_mode)
            results["data"]["anc_response"] = res
            
        controller.disconnect()
    else:
        results["status"] = "error"
        results["message"] = "Failed to connect to earbuds"

    if args.json:
        print(json.dumps(results))

if __name__ == "__main__":
    main()
