import paramiko
import sys

HOSTNAME = "72.61.98.100"
USERNAME = "root"
PASSWORD = "2991985Sila@a"

def read_nginx():
    print(f"Connecting to {HOSTNAME}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(HOSTNAME, username=USERNAME, password=PASSWORD)
        print("Connected.")

        # Check default config
        stdin, stdout, stderr = client.exec_command('cat /etc/nginx/sites-enabled/default')
        content = stdout.read().decode('utf-8')
        
        if not content:
            # Try finding other configs
            stdin, stdout, stderr = client.exec_command('ls /etc/nginx/sites-enabled/')
            files = stdout.read().decode('utf-8').split()
            print(f"Files in sites-enabled: {files}")
            if files:
                 stdin, stdout, stderr = client.exec_command(f'cat /etc/nginx/sites-enabled/{files[0]}')
                 content = stdout.read().decode('utf-8')

        print("\n--- NGINX CONFIG ---")
        print(content)
        print("--------------------")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    read_nginx()
