import requests
import time
import json

BASE_URL = "http://127.0.0.1:8000"
# Use your actual Excel file
filename = "list-of-active-channel-partners-aug21_20260319_150550_c20c382d_extracted (1).xlsx"

print(f"\n--- Testing /upload with {filename} ---")
with open(filename, "rb") as f:
    # Use correct MIME type for Excel (.xlsx)
    files = {"file": (filename, f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    response = requests.post(f"{BASE_URL}/upload", files=files)

print(f"Status Code: {response.status_code}")
if response.status_code == 200:
    res_json = response.json()
    print("Upload successful!")
    session_id = res_json.get("session_id")
    
    if session_id:
        questions = [
            "Total channel partners whose city is kolkata",
        ]
        
        for q in questions:
            print(f"\n--- Testing /chat ---")
            print(f"Question: {q}")
            
            chat_payload = {
                "session_id": session_id,
                "question": q
            }
            start = time.time()
            chat_res = requests.post(f"{BASE_URL}/chat", json=chat_payload)
            end = time.time()
            print(f"Status Code: {chat_res.status_code} (Took {end-start:.2f}s)")
            print(json.dumps(chat_res.json(), indent=2))
else:
    print("Upload Failed:", response.text)
