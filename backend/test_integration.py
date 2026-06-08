import subprocess
import time
import json
import sys

def main():
    print("Starting mock earbuds server...")
    server_proc = subprocess.Popen([sys.executable, "backend/mock_earbuds.py"])
    
    time.sleep(1) # Wait for server to bind
    
    try:
        print("Running moto_control.py against mock server...")
        result = subprocess.run([
            sys.executable, "backend/moto_control.py", 
            "--battery", "--json", 
            "--mac", "127.0.0.1", "--port", "5001"
        ], capture_output=True, text=True)
        
        output = result.stdout.strip()
        print(f"Output: {output}")
        
        data = json.loads(output)
        assert data["status"] == "success", "Expected status to be success"
        
        raw = data["data"]["battery_raw"]
        print(f"Raw Battery Response: {raw}")
        
        # In mock, we sent 0x0005 ACK (len 0) AND 0x0009 Notification (len 3)
        # So we expect multiple packets concatenated in the HEX!
        # Head (4) + TotalLen(2) + Opcode(2) + ...
        # The frontend parser handles this now.
        assert len(raw) > 30, "Expected a concatenated hex string of multiple packets"
        assert "0009" in raw, "Expected Opcode 0x0009 to be present in the raw hex"
        assert "645a50" in raw, "Expected Mock Battery payload (100, 90, 80) to be present"
        
        print("\n✅ INTEGRATION TEST PASSED: moto_control successfully captured the asynchronous battery notification!")
    except Exception as e:
        print(f"\n❌ INTEGRATION TEST FAILED: {e}")
        sys.exit(1)
    finally:
        server_proc.terminate()
        server_proc.wait()

if __name__ == "__main__":
    main()
