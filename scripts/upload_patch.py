import paramiko
import os
import sys

HOSTNAME = "72.61.98.100"
USERNAME = "root"
PASSWORD = "2991985Sila@a"

def upload_and_apply_zip():
    local_path = "d:/mohammad-al-qudah-platform/patch_kb.zip"
    remote_path = "/root/qudah-platform/patch_kb.zip"
    
    print(f"Connecting to {HOSTNAME}...")
    transport = paramiko.Transport((HOSTNAME, 22))
    transport.connect(username=USERNAME, password=PASSWORD)
    sftp = paramiko.SFTPClient.from_transport(transport)
    
    print(f"Uploading {local_path}...")
    sftp.put(local_path, remote_path)
    sftp.close()
    transport.close()
    
    # Exec commands
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOSTNAME, username=USERNAME, password=PASSWORD)
    
    # Check if unzip is installed, if not try python unzipper
    cmds = [
        "cd /root/qudah-platform",
        # Use python to unzip to avoid 'unzip' dependency missing
        "python3 -c \"import zipfile; zipfile.ZipFile('patch_kb.zip', 'r').extractall('.')\"",
        "rm patch_kb.zip",
        "echo '📦 Patch Applied. Rebuilding...'",
        "npm run build",
        "pm2 reload ecosystem.config.js"
    ]
    
    full_cmd = " && ".join(cmds)
    print("Applying patch and rebuilding...")
    stdin, stdout, stderr = client.exec_command(full_cmd)
    
    while True:
        line = stdout.readline()
        if not line: break
        print(line.strip())
        
    print(stderr.read().decode())
    client.close()

if __name__ == "__main__":
    upload_and_apply_zip()
