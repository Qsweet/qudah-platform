
import paramiko
import time

HOSTNAME = "72.61.98.100"
USERNAME = "root"
PASSWORD = "2991985Sila@a"

def watch_logs():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(HOSTNAME, username=USERNAME, password=PASSWORD)
        print("Connected. Streaming logs (Press Ctrl+C to stop)...")
        
        # Follow logs
        cmd = "docker logs -f --tail 10 qudah-platform"
        stdin, stdout, stderr = client.exec_command(cmd)
        
        # Non-blocking read loop logic would be complex here for a simple tool call.
        # We'll just read for a fixed duration to capture the event.
        
        start_time = time.time()
        while time.time() - start_time < 20: # Monitor for 20 seconds
            if stdout.channel.recv_ready():
                 print(stdout.channel.recv(1024).decode('utf-8', errors='replace'), end="")
            if stderr.channel.recv_ready():
                 print(stderr.channel.recv(1024).decode('utf-8', errors='replace'), end="")
            time.sleep(0.1)

    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    watch_logs()
