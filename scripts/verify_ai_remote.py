import requests
import json
import time

url = 'http://72.61.98.100:3000/api/ai/query'
headers = {'Content-Type': 'application/json'}
data = {'messages': [{'role': 'user', 'content': 'Who is Mohammad?'}]}

print(f"Testing {url}...")

try:
    response = requests.post(url, headers=headers, json=data, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {response.headers}")
    print(f"Response Body: {response.text[:200]}")
    
    if response.status_code == 200:
        print("SUCCESS: Remote AI Query endpoint is working!")
        if "Architect" in response.text or "Qudah" in response.text:
             print("SUCCESS: RAG Context verified (Found expected keywords).")
        else:
             print("WARNING: Response might not be using RAG context.")
    else:
        print(f"FAILURE: Endpoint returned {response.status_code}")

except Exception as e:
    print(f"Error: {e}")
