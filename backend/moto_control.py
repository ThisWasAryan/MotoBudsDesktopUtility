import socket
import binascii
import struct
import time
import argparse
import sys
import json
import subprocess

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
        self.log(f"[*] Connecting to {self.mac_address} on Port {self.port}...")
        if self.mac_address == "127.0.0.1":
            self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        else:
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
                self.sock.settimeout(0.5)
                all_data = bytearray()
                chunk = self.sock.recv(4096)
                if chunk:
                    all_data.extend(chunk)
                    self.sock.settimeout(0.2)
                    while True:
                        try:
                            more = self.sock.recv(4096)
                            if not more: break
                            all_data.extend(more)
                        except socket.timeout:
                            break
                self.sock.settimeout(3.0)
                return bytes(all_data) if all_data else None
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

    def toggle_game_mode(self, enabled: int):
        self.log(f"[*] Setting Game Mode: {enabled}")
        resp = self._send_and_receive(0x030F, bytes([enabled]))
        return resp.hex() if resp else None

    def toggle_inear(self, enabled: int):
        self.log(f"[*] Setting In-Ear Detection: {enabled}")
        resp = self._send_and_receive(0x0403, bytes([enabled]))
        return resp.hex() if resp else None

    def toggle_volboost(self, enabled: int):
        self.log(f"[*] Setting Volume Boost: {enabled}")
        resp = self._send_and_receive(0x0314, bytes([enabled]))
        return resp.hex() if resp else None

    def toggle_hires(self, enabled: int):
        self.log(f"[*] Setting Hi-Res Mode: {enabled}")
        resp = self._send_and_receive(0x030D, bytes([enabled]))
        
        # In Linux, changing the codec on the earbud side doesn't automatically cause PipeWire/BlueZ 
        # to renegotiate the A2DP codec (unlike Android). We must forcefully bounce the connection.
        if self.mac_address != "127.0.0.1":
            self.log("[*] Forcing Bluetooth renegotiation for codec switch...")
            try:
                # Issue the disconnect command asynchronously so we can return the success response to UI first
                subprocess.Popen(
                    f"sleep 1 && bluetoothctl disconnect {self.mac_address} && sleep 2 && bluetoothctl connect {self.mac_address}", 
                    shell=True
                )
            except Exception as e:
                self.log(f"[-] Failed to restart bluetooth interface: {e}")
                
        return resp.hex() if resp else None

    def toggle_fit(self, start: int):
        self.log(f"[*] Setting Fit Test: {start}")
        resp = self._send_and_receive(0x0400, bytes([start]))
        return resp.hex() if resp else None

    def toggle_fmd(self, mode: int):
        self.log(f"[*] Setting FMD Mode: {mode}")
        resp = self._send_and_receive(0x0405, bytes([mode]))
        return resp.hex() if resp else None

def main():
    parser = argparse.ArgumentParser(description="Moto Buds Controller")
    parser.add_argument("--battery", action="store_true", help="Read battery levels")
    parser.add_argument("--info", action="store_true", help="Read hardware info")
    parser.add_argument("--anc", type=int, choices=[0, 1, 2], help="Set ANC Mode (0=Off, 1=ANC, 2=Transparency)")
    parser.add_argument("--game", type=int, choices=[0, 1], help="Set Game Mode")
    parser.add_argument("--inear", type=int, choices=[0, 1], help="Set In-Ear Detection")
    parser.add_argument("--volboost", type=int, choices=[0, 1], help="Set Volume Boost")
    parser.add_argument("--hires", type=int, choices=[0, 1], help="Set Hi-Res/LDAC")
    parser.add_argument("--fit", type=int, choices=[0, 1], help="Set Fit Test (0=Stop, 1=Start)")
    parser.add_argument("--fmd", type=int, choices=[0, 1, 2, 3], help="Set Find My Device Mode")
    parser.add_argument("--keepalive", type=int, help="Keep SPP connection alive for N seconds to capture async events")
    parser.add_argument("--sync", action="store_true", help="Sync startup states (ANC, HiRes, Game, InEar)")
    parser.add_argument("--json", action="store_true", help="Output results in JSON format")
    parser.add_argument("--mac", type=str, default=CLASSIC_MAC, help="MAC address or 127.0.0.1 for mock")
    parser.add_argument("--port", type=int, default=RFCOMM_PORT, help="Port")
    
    args = parser.parse_args()
    
    if not any([args.battery, args.info, args.anc is not None, args.game is not None, args.inear is not None, args.volboost is not None, args.hires is not None, args.fit is not None, args.fmd is not None, args.sync]):
        parser.print_help()
        sys.exit(1)

    controller = MotoBudsController(mac_address=args.mac, port=args.port, output_json=args.json)
    
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
        if args.game is not None:
            res = controller.toggle_game_mode(args.game)
            results["data"]["game_response"] = res
        if args.inear is not None:
            res = controller.toggle_inear(args.inear)
            results["data"]["inear_response"] = res
        if args.volboost is not None:
            res = controller.toggle_volboost(args.volboost)
            results["data"]["volboost_response"] = res
        if args.hires is not None:
            res = controller.toggle_hires(args.hires)
            results["data"]["hires_response"] = res
        if args.fit is not None:
            res = controller.toggle_fit(args.fit)
            results["data"]["fit_response"] = res
        if args.fmd is not None:
            res = controller.toggle_fmd(args.fmd)
            results["data"]["fmd_response"] = res

        if args.sync:
            # Opcode 512, 780, 782, 1026
            res_anc = controller._send_and_receive(0x0200, b"")
            res_hires = controller._send_and_receive(0x030C, b"")
            res_game = controller._send_and_receive(0x030E, b"")
            res_inear = controller._send_and_receive(0x0402, b"")
            if res_anc: results["data"]["anc_raw"] = res_anc.hex()
            if res_hires: results["data"]["hires_raw"] = res_hires.hex()
            if res_game: results["data"]["game_raw"] = res_game.hex()
            if res_inear: results["data"]["inear_raw"] = res_inear.hex()

        if args.keepalive:
            controller.log(f"[*] Keeping connection alive for {args.keepalive} seconds...")
            start_t = time.time()
            async_events = []
            try:
                controller.sock.settimeout(1.0)
                while time.time() - start_t < args.keepalive:
                    try:
                        data = controller.sock.recv(1024)
                        if data:
                            async_events.append(data.hex())
                            controller.log(f"[+] Async Event: {data.hex()}")
                    except socket.timeout:
                        continue
            except Exception as e:
                controller.log(f"[-] Keepalive error: {e}")
            finally:
                controller.sock.settimeout(2.0)
            results["data"]["async_events"] = async_events
            
        controller.disconnect()
    else:
        results["status"] = "error"
        results["message"] = "Failed to connect to earbuds"

    if args.json:
        print(json.dumps(results))

if __name__ == "__main__":
    main()
