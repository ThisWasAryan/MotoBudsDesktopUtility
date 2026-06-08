import time
import datetime
import binascii
from moto_control import MotoBudsController

print("=======================================")
print("Moto Buds Hardware Diagnostics Capture")
print("=======================================")
print("Connecting to earbuds...")

controller = MotoBudsController()
if not controller.connect():
    print("[-] Failed to connect. Ensure they are paired and not currently in use by the app.")
    exit(1)

print("[+] Connected successfully via SPP!")
print("[*] Listening for all incoming packets. Perform the physical actions now.")
print("[*] Press Ctrl+C to stop.\n")

controller.sock.settimeout(1.0)

try:
    while True:
        try:
            data = controller.sock.recv(1024)
            if data:
                # Basic parsing to extract opcode and payload if possible
                hex_data = data.hex()
                
                # Check if it has HEAD and TAIL
                if b'HEAD' in data and b'TAIL' in data:
                    try:
                        head_idx = data.index(b'HEAD')
                        packet = data[head_idx:]
                        
                        opcode = int.from_bytes(packet[4:6], byteorder='little')
                        length = int.from_bytes(packet[6:8], byteorder='little')
                        payload = packet[8:8+length]
                        
                        timestamp = datetime.datetime.now().strftime("%H:%M:%S.%f")[:-3]
                        print(f"[{timestamp}] OPCODE: {opcode} (0x{opcode:04X}) | LENGTH: {length} | PAYLOAD: {payload.hex()}")
                    except Exception as e:
                        print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] RAW (Failed to parse): {hex_data}")
                else:
                    print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] RAW: {hex_data}")
        except TimeoutError:
            continue
        except Exception as e:
            if "timed out" not in str(e).lower():
                print(f"[-] Socket error: {e}")
                
except KeyboardInterrupt:
    print("\n[+] Capture stopped by user.")
finally:
    controller.disconnect()
    print("[*] Disconnected.")
