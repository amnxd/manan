import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin
def initialize_firebase():
    if not firebase_admin._apps:
        # Check for service account file
        service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "nova-scholar-f10d5-firebase-adminsdk-fbsvc-9ac6252f8f.json")
        
        if os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            print(f"Firebase Admin initialized with service account: {service_account_path}")
        else:
            print(f"WARNING: Service account not found at {service_account_path}")
            try:
                firebase_admin.initialize_app()
            except Exception as e:
                print(f"Failed to initialize Firebase Admin: {e}")
                pass
    
    return firestore.client()

db = initialize_firebase()
auth = firebase_auth
