import os
import random
from typing import Optional
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from firebase_admin import firestore, auth

load_dotenv()

app = FastAPI(title="Nova Scholar API")

# CORS Configuration
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "Nova API Active"}


# ─── Ask Nova (Solve Doubt) ───────────────────────────────────────────────────

class DoubtRequest(BaseModel):
    student_id: str
    question_text: str
    image_url: Optional[str] = None


@app.post("/solve-doubt")
def solve_doubt(request: DoubtRequest):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {
            "answer": "Error: GOOGLE_API_KEY not found in environment variables.",
            "citations": []
        }
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=request.question_text,
        )
        return {
            "answer": response.text,
            "citations": ["General Knowledge", "Gemini Model"]
        }
    except Exception as e:
        return {
            "answer": f"Error processing request: {str(e)}",
            "citations": []
        }


# ─── Academic Predictor ───────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    attendance: float
    marks: float


@app.post("/predict")
def predict_risk(req: PredictRequest):
    attendance = max(0, min(100, req.attendance))
    marks = max(0, min(100, req.marks))

    if attendance < 75 or marks < 50:
        risk_level = "High"
    elif attendance < 85 or marks < 70:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    predicted_cgpa = round((attendance * 0.03 + marks * 0.07) * 0.1 * 10, 2)
    predicted_cgpa = max(0.0, min(10.0, predicted_cgpa))

    return {
        "risk_level": risk_level,
        "predicted_cgpa": predicted_cgpa,
    }


# ─── Resume Analyzer ──────────────────────────────────────────────────────────

@app.post("/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {
            "score": 0,
            "feedback": ["Error: GOOGLE_API_KEY not set. Cannot analyze resume."]
        }

    try:
        contents = await file.read()
        try:
            text = contents.decode("utf-8", errors="ignore")
        except Exception:
            text = str(contents[:3000])

        text = text[:4000]

        prompt = (
            "You are an expert technical recruiter. Analyze the following resume text and provide:\n"
            "1. An ATS score from 0-100 (integer).\n"
            "2. Exactly 4 concise bullet-point feedback items (start each with a dash -).\n\n"
            "Respond ONLY in this exact format:\n"
            "SCORE: <number>\n"
            "FEEDBACK:\n"
            "- <point 1>\n"
            "- <point 2>\n"
            "- <point 3>\n"
            "- <point 4>\n\n"
            f"Resume text:\n{text}"
        )

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        raw = response.text.strip()

        score = 65
        feedback = []
        for line in raw.splitlines():
            if line.upper().startswith("SCORE:"):
                try:
                    score = int(line.split(":", 1)[1].strip())
                except ValueError:
                    pass
            elif line.strip().startswith("-"):
                feedback.append(line.strip().lstrip("- ").strip())

        if not feedback:
            feedback = ["Could not parse feedback. Please try again."]

        return {"score": score, "feedback": feedback}

    except Exception as e:
        return {
            "score": 0,
            "feedback": [f"Error analyzing resume: {str(e)}"]
        }


# ─── Student Profile ──────────────────────────────────────────────────────────

@app.get("/student/profile")
def get_student_profile():
    return {
        "name": "Alex Johnson",
        "branch": "Computer Science & Engineering",
        "cgpa": 8.2,
        "attendance": 94,
        "semester": "Semester 6",
        "email": "alex.j@novascholar.com",
        "year": "3rd Year",
        "role": "Class Rep",
    }


# ─── Auth Sync ────────────────────────────────────────────────────────────────

class UserSyncRequest(BaseModel):
    token: str
    role: str  # "student" or "admin"


@app.post("/auth/sync")
async def sync_user(request: UserSyncRequest):
    try:
        decoded_token = auth.verify_id_token(request.token)
        uid = decoded_token["uid"]
        email = decoded_token.get("email", "")

        from firebase_config import db

        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()

        final_role = request.role

        if user_doc.exists:
            user_data = user_doc.to_dict()
            final_role = user_data.get("role", "student")
        else:
            if final_role not in ["student", "admin"]:
                final_role = "student"
            user_data = {
                "uid": uid,
                "email": email,
                "role": final_role,
                "created_at": firestore.SERVER_TIMESTAMP,
            }
            user_ref.set(user_data)

        return {"status": "success", "role": final_role, "uid": uid}

    except Exception as e:
        return {"status": "error", "message": str(e)}
