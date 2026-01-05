import paramiko
import time
import sys

HOSTNAME = "72.61.98.100"
USERNAME = "root"
PASSWORD = "2991985Sila@a"

def deploy():
    print(f"Connecting to {HOSTNAME}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(HOSTNAME, username=USERNAME, password=PASSWORD)
        print("Connected successfully.")

        # 1. Find the project directory
        print("Searching for project directory...")
        stdin, stdout, stderr = client.exec_command('find / -name "docker-compose.yml" 2>/dev/null | grep "mohammad-al-qudah-platform" | head -n 1')
        project_path_file = stdout.read().decode().strip()
        
        if not project_path_file:
            print("Could not find project directory automatically. debugging...")
            
            # Fallback attempts
            potential_paths = [
                "/root/mohammad-al-qudah-platform",
                "/root/qudah-platform",
                "/var/www/mohammad-al-qudah-platform",
                "/var/www/qudah-platform"
            ]
            
            project_path = None
            for p in potential_paths:
                stdin, stdout, stderr = client.exec_command(f'ls -d {p}')
                if stdout.channel.recv_exit_status() == 0:
                    project_path = p
                    break
            
            if not project_path:
                print("Project not found in common locations. Exiting.")
                return
        else:
             project_path = project_path_file.replace("/docker-compose.yml", "") # Assuming it was found via docker-compose
             # If found via package.json, adjust accordingly. But original used docker-compose.
             # Let's trust the logic that worked before or try to be smarter.
             # The original script searched for docker-compose.yml. 
             # I should probably search for package.json or ecosystem.config.js now, but ecosystem might not be there yet until I pull.
             # So searching for docker-compose.yml (which exists on repo) is a safe bet for finding the folder.

        print(f"Project found at: {project_path}")
        
        commands = [
            f"cd {project_path}",
            "echo 'Resetting to clean state...'",
            "git fetch origin",
            "git reset --hard origin/main",
            "echo 'Granting execute permissions...'",
            "chmod +x deploy_pm2.sh",
            "echo 'Running PM2 deployment script...'",
            "./deploy_pm2.sh"
        ]
        
        full_command = " && ".join(commands)
        
        print(f"Executing: {full_command}")
        
        stdin, stdout, stderr = client.exec_command(full_command)
        
        # Stream output
        while not stdout.channel.exit_status_ready():
            if stdout.channel.recv_ready():
                 print(stdout.channel.recv(1024).decode('utf-8', errors='replace'), end="")
            if stderr.channel.recv_ready():
                 print(stderr.channel.recv(1024).decode('utf-8', errors='replace'), end="")
            time.sleep(0.1)

        # Print remaining
        print(stdout.read().decode('utf-8', errors='replace'), end="")
        print(stderr.read().decode('utf-8', errors='replace'), end="")
        
        exit_code = stdout.channel.recv_exit_status()
        print(f"\nDeployment finished with exit code: {exit_code}")
        
        if exit_code == 0:
            print("SUCCESS: Remote PM2 deployment completed.")
        else:
            print("FAILURE: Remote PM2 deployment failed.")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    deploy()
