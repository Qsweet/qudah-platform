import requests
import json

url = 'http://localhost:3000/api/ai/query'
headers = {'Content-Type': 'application/json'}
data = {'messages': [{'role': 'user', 'content': 'Hello'}]}

try:
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:200]}")
    if response.status_code == 200:
        print("SUCCESS: AI Query endpoint is reachable and responding.")
    else:
        print("FAILURE: Endpoint returned error.")
except Exception as e:
    print(f"Error: {e}")
