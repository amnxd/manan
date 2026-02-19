import firebase_admin
from firebase_admin import credentials, firestore
import os

if not firebase_admin._apps:
    try:
        cred = credentials.Certificate("nova-scholar-f10d5-firebase-adminsdk-fbsvc-9ac6252f8f.json")
        firebase_admin.initialize_app(cred)
    except:
        pass

db = firestore.client()
db.collection("system").document("settings").set({"exam_mode": True}, merge=True)
print("Exam Mode set to TRUE")
