import paramiko

HOSTNAME = "72.61.98.100"
USERNAME = "root"
PASSWORD = "2991985Sila@a"

def kill_container():
    print(f"Connecting to {HOSTNAME}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(HOSTNAME, username=USERNAME, password=PASSWORD)
        
        # 1. Find ID
        print("Finding container on port 3000...")
        stdin, stdout, stderr = client.exec_command("docker ps --filter publish=3000 -q")
        container_id = stdout.read().decode('utf-8').strip()
        
        if container_id:
            print(f"Found container: {container_id}. Stopping...")
            client.exec_command(f"docker stop {container_id}")
            client.exec_command(f"docker rm {container_id}")
            print("Container stopped and removed.")
        else:
            print("No container found on port 3000.")
            
        # 2. Restart PM2 just in case it crashed/gave up
        print("Restarting PM2...")
        client.exec_command("pm2 restart all")
        print("PM2 restarted.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    kill_container()
