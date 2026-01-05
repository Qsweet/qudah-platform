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
        # Add specific folders
        for folder in ['src/app/admin', 'src/app/actions']:
            full_path = os.path.join("d:/mohammad-al-qudah-platform", folder)
            if os.path.exists(full_path):
                zip_dir(full_path, zipf)
            else:
                print(f"Warning: {folder} not found")
        
        # Add schema
        zipf.write(os.path.join("d:/mohammad-al-qudah-platform", 'src/db/schema.ts'), 'src/db/schema.ts')
    
    print("Patch created successfully.")

if __name__ == "__main__":
    create_patch()
