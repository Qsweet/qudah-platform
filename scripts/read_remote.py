import paramiko
import sys

HOSTNAME = "72.61.98.100"
USERNAME = "root"
PASSWORD = "2991985Sila@a"

def read_file(path):
    print(f"Reading {path} from {HOSTNAME}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(HOSTNAME, username=USERNAME, password=PASSWORD)
        
        cmd = f'cat {path}'
        stdin, stdout, stderr = client.exec_command(cmd)
        content = stdout.read().decode('utf-8')
        err = stderr.read().decode('utf-8')
        
        if content:
            print("\n--- CONTENT START ---")
            print(content)
            print("--- CONTENT END ---\n")
        
        if err:
            print(f"STDERR: {err}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python read_remote.py <path>")
        sys.exit(1)
    read_file(sys.argv[1])
