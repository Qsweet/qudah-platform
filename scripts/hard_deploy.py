import paramiko
import sys
import time

HOSTNAME = "72.61.98.100"
USERNAME = "root"
PASSWORD = "2991985Sila@a"

def run_hard_deploy():
    print(f"Connecting to {HOSTNAME}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(HOSTNAME, username=USERNAME, password=PASSWORD)
        
        commands = [
            "echo '🛑 Stopping PM2...'",
            "pm2 delete all || true", # Ignore error if already deleted
            
            "echo '🧹 Cleaning .next directory...'",
            "cd /root/qudah-platform && rm -rf .next",
            
            "echo '📥 Pulling latest code...'",
            "cd /root/qudah-platform && git fetch origin && git reset --hard origin/main",
            
            "echo '🛠️ Building (Fresh)...'",
            "cd /root/qudah-platform && npm run build",
            
            "echo '📂 Coping Standalone Assets...'",
            # Ensure standalone dir exists (Next.js creates it, but we prepare structure)
            # Actually next build output: 'standalone' creates it.
            # We just need to copy static assets.
            "cd /root/qudah-platform && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/",

            "echo '🚀 Starting PM2...'",
            "cd /root/qudah-platform && pm2 start ecosystem.config.js --env production",
            
            "echo '✅ Done!'"
        ]
        
        full_cmd = " && ".join(commands)
        
        print("Executing sequence...")
        stdin, stdout, stderr = client.exec_command(full_cmd)
        
        # Stream output
        while True:
            line = stdout.readline()
            if not line:
                break
            print(line.strip())
            
        err = stderr.read().decode('utf-8')
        if err:
            print(f"\nSTDERR:\n{err}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    run_hard_deploy()
