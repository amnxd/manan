import firebase_admin
from firebase_admin import credentials, firestore
import requests
import json
import os

# Initialize Firebase if not already
if not firebase_admin._apps:
    cred_path = "nova-scholar-f10d5-firebase-adminsdk-fbsvc-9ac6252f8f.json"
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        print(f"Error: {cred_path} not found")
        exit(1)

db = firestore.client()

# 1. Set exam_mode = True
print("--- TEST 1: Exam Mode ON ---")
db.collection("system").document("settings").set({"exam_mode": True}, merge=True)
print("System setting 'exam_mode' set to True in Firestore.")

# 2. Call solve-doubt
url = "http://127.0.0.1:8000/solve-doubt"
payload = {"student_id": "test_student", "question_text": "What is Python?"}
print("Calling solve-doubt...")
try:
    res = requests.post(url, json=payload)
    response_data = res.json()
    print("Response:", json.dumps(response_data, indent=2))
    
    if "Exam Mode is Active" in str(response_data.get("answer", "")):
        print("✅ PASS: Blocked by Exam Mode")
    else:
        print("❌ FAIL: Request was not blocked")
except Exception as e:
    print("Error calling API:", e)

# 3. Set exam_mode = False
print("\n--- TEST 2: Exam Mode OFF ---")
db.collection("system").document("settings").set({"exam_mode": False}, merge=True)
print("System setting 'exam_mode' set to False in Firestore.")

# 4. Call solve-doubt again
print("Calling solve-doubt...")
try:
    res = requests.post(url, json=payload)
    response_data = res.json()
    # It might fail due to missing API key, but should NOT say "Exam Mode is Active"
    print("Response:", json.dumps(response_data, indent=2))
    
    if "Exam Mode is Active" not in str(response_data.get("answer", "")):
        print("✅ PASS: Allowed (or failed for other reasons)")
    else:
        print("❌ FAIL: Still blocked by Exam Mode")

except Exception as e:
    print("Error calling API:", e)
