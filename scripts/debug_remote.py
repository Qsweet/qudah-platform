
import paramiko
import time

HOSTNAME = "72.61.98.100"
USERNAME = "root"
PASSWORD = "2991985Sila@a"

def debug():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(HOSTNAME, username=USERNAME, password=PASSWORD)
        print("Connected successfully.")
        
        commands = [
            "echo 'Checking port 3000 usage...'",
            "lsof -i :3000 || netstat -tulnp | grep 3000",
            "echo 'Checking docker containers...'",
            "docker ps",
            "echo 'Checking PM2 status...'",
            "pm2 status || echo 'PM2 not found'",
        ]
        
        for cmd in commands:
            print(f"\nRunning: {cmd}")
            stdin, stdout, stderr = client.exec_command(cmd)
            print(stdout.read().decode('utf-8', errors='replace'))
            err = stderr.read().decode('utf-8', errors='replace')
            if err:
                print(f"Error/Stderr: {err}")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    debug()
