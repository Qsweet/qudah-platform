
import paramiko

HOSTNAME = "72.61.98.100"
USERNAME = "root"
PASSWORD = "2991985Sila@a"

def test_api():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(HOSTNAME, username=USERNAME, password=PASSWORD)
        print("Connected. Testing API...")
        
        # Test Payload
        payload = '{"messages": [{"role": "user", "content": "Hello Qudah"}]}'
        cmd = f'curl -X POST http://localhost:3000/api/ai/query -H "Content-Type: application/json" -d \'{payload}\''
        
        print(f"Running: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        
        output = stdout.read().decode('utf-8', errors='replace')
        error = stderr.read().decode('utf-8', errors='replace')
        
        print(f"Response: {output}")
        if error:
            print(f"Stderr: {error}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    test_api()
