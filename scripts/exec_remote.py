import paramiko
import sys

HOSTNAME = "72.61.98.100"
USERNAME = "root"
PASSWORD = "2991985Sila@a"

def exec_cmd(cmd):
    print(f"Executing '{cmd}' on {HOSTNAME}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(HOSTNAME, username=USERNAME, password=PASSWORD)
        
        stdin, stdout, stderr = client.exec_command(cmd)
        
        # Stream output
        print("--- STDOUT ---")
        print(stdout.read().decode('utf-8'))
        print("--- STDERR ---")
        print(stderr.read().decode('utf-8'))

    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python exec_remote.py <command>")
        sys.exit(1)
    # Join args to allow "ls -la" etc
    cmd = " ".join(sys.argv[1:])
    exec_cmd(cmd)
