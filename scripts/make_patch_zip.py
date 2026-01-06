import zipfile
import os

def zip_dir(path, ziph):
    # ziph is zipfile handle
    for root, dirs, files in os.walk(path):
        for file in files:
            file_path = os.path.join(root, file)
            # Archive name should be relative to project root
            arcname = os.path.relpath(file_path, "d:/mohammad-al-qudah-platform")
            ziph.write(file_path, arcname)

def create_patch():
    print("Creating patch_kb.zip...")
    with zipfile.ZipFile('patch_kb.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add entire src directory
        if os.path.exists("d:/mohammad-al-qudah-platform/src"):
             zip_dir("d:/mohammad-al-qudah-platform/src", zipf)
        
        # Add root config files
        for file in ['ecosystem.config.js', 'package.json', 'next.config.ts', 'tsconfig.json']:
            full_path = os.path.join("d:/mohammad-al-qudah-platform", file)
            if os.path.exists(full_path):
                zipf.write(full_path, file)
            else:
                 print(f"Warning: {file} not found")
    
    print("Patch created successfully.")

if __name__ == "__main__":
    create_patch()
