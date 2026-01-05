
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
            
            # Debug: List directories
            for path in ["/root", "/var/www", "/home"]:
                print(f"Listing {path}:")
                stdin, stdout, stderr = client.exec_command(f'ls -F {path}')
                print(stdout.read().decode())
            
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
             project_path = project_path_file.replace("/docker-compose.yml", "")

        print(f"Project found at: {project_path}")
        
        # 2. Deploy
        commands = [
            f"cd {project_path}",
            "echo 'Stopping conflicting PM2 processes...'",
            "pm2 delete all || true",
            "echo 'Discarding local changes to deploy.sh...'",
            "git checkout deploy.sh",
            "echo 'Pulling latest changes...'",
            "git pull origin main",
            "echo 'Running deploy script...'",
            "chmod +x deploy.sh",
            "./deploy.sh"
        ]
        
        full_command = " && ".join(commands)
        
        print(f"Executing deployment sequence: {full_command}")
        
        # Open a session to capture output in real-time
        stdin, stdout, stderr = client.exec_command(full_command)
        
        # Stream output
        while not stdout.channel.exit_status_ready():
            if stdout.channel.recv_ready():
                 try:
                     print(stdout.channel.recv(1024).decode('utf-8', errors='replace'), end="")
                 except:
                     pass
            if stderr.channel.recv_ready():
                 try:
                     print(stderr.channel.recv(1024).decode('utf-8', errors='replace'), end="")
                 except:
                     pass
            time.sleep(0.1)

        # Print remaining
        try:
            print(stdout.read().decode('utf-8', errors='replace'), end="")
            print(stderr.read().decode('utf-8', errors='replace'), end="")
        except:
             pass
        
        exit_code = stdout.channel.recv_exit_status()
        print(f"\nDeployment finished with exit code: {exit_code}")
        
        if exit_code == 0:
            print("SUCCESS: Deployment completed.")
        else:
             print("FAILURE: Deployment failed.")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    deploy()
