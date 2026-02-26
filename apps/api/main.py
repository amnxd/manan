
import os
import random
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
import firebase_admin
from firebase_admin import credentials, firestore, auth
from thefuzz import fuzz

load_dotenv()

# ─── Initialize Firebase Admin SDK ────────────────────────────────────────────
_service_account_path = os.getenv(
    "FIREBASE_SERVICE_ACCOUNT_PATH",
    "nova-scholar-f10d5-firebase-adminsdk-fbsvc-9ac6252f8f.json"
)

if not firebase_admin._apps:
    if os.path.exists(_service_account_path):
        _cred = credentials.Certificate(_service_account_path)
        firebase_admin.initialize_app(_cred)
        print(f"✅ Firebase Admin initialized with: {_service_account_path}")
    else:
        print(f"⚠️  Service account not found: {_service_account_path}")

db = firestore.client()

# ─── FastAPI App ──────────────────────────────────────────────────────────────

app = FastAPI(title="Manan API")

# CORS Configuration
origins = [
    "http://localhost:3000",
    "https://manan-iota.vercel.app",
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
    return {"status": "Manan API Active"}


# ─── Ask Nova (Solve Doubt) ───────────────────────────────────────────────────

OSI_MODEL_RESPONSE = """
📡 **Explain the OSI Model**

The **OSI (Open Systems Interconnection) Model** is a conceptual framework developed by **ISO (International Organization for Standardization)** that standardizes how data is transmitted across a network.

It divides network communication into **7 distinct layers**, each with a specific responsibility.

---

### 🏗 **The 7 Layers of the OSI Model (Top to Bottom)**

#### **7️⃣ Application Layer**
- **Closest to the user.**
- Provides network services to applications.
- **Examples:** HTTP, FTP, SMTP, DNS.
- **Function:** Enables communication between user applications and the network.

#### **6️⃣ Presentation Layer**
- Handles data formatting.
- Encryption and decryption.
- Data compression.
- **Function:** Ensures data is readable by the receiving system.

#### **5️⃣ Session Layer**
- Establishes, maintains, and terminates communication sessions.
- Manages checkpoints and recovery.
- **Function:** Controls dialogue between two systems.

#### **4️⃣ Transport Layer**
- Responsible for **end-to-end communication**.
- Ensures reliable delivery.
- Error detection and flow control.
- **Protocols:**
  - **TCP** (reliable)
  - **UDP** (fast, unreliable)
- **Function:** Breaks data into segments and ensures complete delivery.

#### **3️⃣ Network Layer**
- Determines the best path for data transfer.
- Handles logical addressing.
- **Example:** IP (Internet Protocol).
- **Function:** Routing and forwarding packets between networks.

#### **2️⃣ Data Link Layer**
- Physical addressing (**MAC address**).
- Error detection at frame level.
- **Function:** Transfers data between directly connected devices.

#### **1️⃣ Physical Layer**
- Transmits raw bits over the physical medium.
- Defines cables, voltage levels, connectors.
- **Function:** Converts data into electrical/optical signals.

---

### 🔄 **Data Flow Example**
When you open a website:
1. **Application layer** sends request (HTTP)
2. **Transport layer** adds TCP segment
3. **Network layer** adds IP address
4. **Data Link layer** adds MAC address
5. **Physical layer** sends bits over cable

*At the receiver’s end, the process happens in reverse.*

---

### 🎯 **Why OSI Model is Important**
✅ Standardizes networking concepts
✅ Helps in troubleshooting network issues
✅ Ensures interoperability between vendors
✅ Simplifies learning complex networking systems

---

### 📌 **Mnemonic to Remember Layers**
*(Top to Bottom)*
**A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing
(Application → Presentation → Session → Transport → Network → Data Link → Physical)
"""

# Hardcoded Responses for Suggested Questions
SUGGESTED_DOUBTS = {
    "Explain quantum computing in simple terms": {
        "text": """
🌌 **Quantum Computing, Simplified**

Imagine you have a giant maze, and you need to find the specific path that leads to the exit.

💻 **A Classical Computer (Your PC/Phone):**
Runs through the maze **one path at a time**. If it hits a dead end, it backs up and tries the next path. Eventually, it finds the exit, but for complex mazes, this takes an incredibly long time.

🧮 **A Quantum Computer:**
Can miraculously run through **ALL paths in the maze at the exact same time**. It finds the exit almost instantly.

---

### ⚛️ **The Core Concepts**

1️⃣ **Qubits (Quantum Bits)**
- Classical bits are either a `0` or a `1` (like a light switch: Off or On).
- **Qubits** can be a `0`, a `1`, or **both simultaneously**. Imagine a spinning coin — while it's spinning in the air, you can't say if it's heads or tails until you catch it. This is called **Superposition**.

2️⃣ **Entanglement**
- Qubits can become mathematically linked. If you change the state of one qubit, its linked partner instantly changes too, even if millions of miles away! Einstein famously called this "spooky action at a distance."

3️⃣ **Interference**
- Quantum computers use waves to naturally cancel out the wrong answers (destructive interference) and amplify the correct probability (constructive interference), quickly filtering out noise to get the right answer.

### 🚀 **Why Does This Matter?**
Quantum computers aren't meant to just be faster versions of your phone. They are purpose-built to solve highly specific, radically complex problems that would take normal computers millions of years:
- **Medicine:** Simulating complex molecular structures to instantly invent new drugs.
- **Security:** Breaking modern cryptography (and inventing totally unhackable encryption).
- **Logistics:** Instantly calculating the most perfectly efficient global shipping routes.
""",
        "citations": ["Quantum Computing Physics", "Qubits and Superposition"]
    },
    
    "Help me understand recursion": {
        "text": """
🔄 **Understanding Recursion**

**Recursion** in computer science is simply when a function calls **itself** in order to solve a problem.

Imagine you are standing in a long line, and you want to know what position you are in. You could tap the person in front of you and ask *"What number are you?"* 
They don't know either, so they tap the person in front of them, and so on... until the very first person at the front is asked. 
The first person confidently says: *"I am number 1."* (This is the **Base Case**).
The second person now knows they are 1 + 1 = 2. They pass that back.
The information ripples back to you, and you find out your position. 

That is exactly how a recursive algorithm works!

---

### 🧱 **The Two Rules of Recursion**
Every successful recursive function must have two things:

1️⃣ **The Base Case (The stop condition):**
A simple condition where the function stops calling itself and returns a value immediately. If you forget this, the function calls itself forever (creating an Infinite Loop / Stack Overflow!)

2️⃣ **The Recursive Step (The breakdown):**
The code logic that breaks the large problem into a slightly smaller piece, and calls itself.

---

### 💻 **A Classic Example: Factorials (Python)**

A factorial in math: `5! = 5 * 4 * 3 * 2 * 1`
As a rule: `n! = n * (n - 1)!` 

Notice how calculating the factorial of `n` requires knowing the factorial of `n-1`? That's perfect for recursion:

```python
def calculate_factorial(n):
    # Rule 1: The Base Case
    if n == 1 or n == 0:
        return 1
        
    # Rule 2: The Recursive Step
    return n * calculate_factorial(n - 1)

print(calculate_factorial(5)) # Outputs 120
```

### 🧠 When to Use It?
Recursion shines when dealing with data structures that branch out, like **Trees** or **Graphs**, or sorting algorithms like **Merge Sort** and **Quick Sort**!
""",
        "citations": ["Computer Science Algorithms", "Python Recursion"]
    },
    
    "What is the difference between TCP and UDP?": {
        "text": """
🌐 **TCP vs. UDP: Two Ways to Send Data**

When your computer communicates over the internet, it sends data in tiny chunks called **packets**. At the Transport Layer of networking, two main protocols dictate *how* these packets are delivered: **TCP** and **UDP**.

---

### 📦 **1. TCP (Transmission Control Protocol)**
**The Delivery Service with Signature Tracking**

Think of TCP like sending a highly valuable registered package via FedEx. 
- You want to guarantee 100% that the package arrives.
- The mail carrier requests a signature. 
- If the package is lost or damaged on the way, the system automatically replaces it and resends it.

**Key Features of TCP:**
- ✅ **Reliable:** Guarantees absolute, flawless delivery of data.
- ✅ **Ordered:** Reassembles packets in the exact correct order. 
- ✅ **Connection-Oriented:** Establishes a formal "handshake" before sending data.
- ❌ **Slower:** All that checking and verifying creates overhead and takes time.

**Real-world Use Cases:**
- Loading webpages (HTTP/HTTPS)
- Sending Emails (SMTP)
- Downloading files (FTP)
*(If you download a picture, you don't want a chunk in the middle missing or out of order!)*

---

### 🚤 **2. UDP (User Datagram Protocol)**
**The Postcard Thrown out the Window**

Think of UDP like standing at a parade throwing out candy. 
- You toss the candy out as fast as possible.
- You don't care if a few pieces hit the ground or if someone misses catching one.
- The goal is maximum speed, zero stopping to check.

**Key Features of UDP:**
- ✅ **Fast:** Incredibly low latency and less overhead.
- ❌ **Unreliable:** Does not guarantee delivery. Packets can just be dropped and lost forever.
- ❌ **Unordered:** Packets can arrive entirely out of order.
- ❌ **Connectionless:** Just starts blasting packets immediately without a handshake.

**Real-world Use Cases:**
- Live Video Streaming / Twitch / YouTube Live
- Voice calls (Discord, Zoom)
- Online Multiplayer Gaming (Valorant, Call of Duty)
*(If a video frame is dropped during a live Zoom call, it's better to immediately skip to the next frame than to awkwardly pause the entire call while waiting for the missing frame to redownload!)*
""",
         "citations": ["Networking Protocols", "Transport Layer Data Transfer"]
    },
    
    "Explain Big O notation with examples": {
         "text": """
⏱️ **Understanding Big O Notation**

**Big O Notation** is a mathematical way of describing the efficiency of an algorithm. 
Specifically, it measures two things as the input size (n) gets larger and larger:
1. **Time Complexity:** How much longer does it take to run?
2. **Space Complexity:** How much more memory does it require?

Instead of measuring code in seconds (because a supercomputer runs the same code faster than a smartwatch), we measure code by the **number of operations** it must perform!

---

### 📈 **Common Big O Complexities (From Best to Worst)**

#### 🟢 **1. O(1) - Constant Time**
No matter how massive the input data gets, the code takes the exact same amount of time. It happens instantly.
- **Example:** Picking up the 5th book off a shelf, whether the shelf has 10 books or 10 million books.
```python
def return_first_element(arr):
    return arr[0]  # Instant lookup!
```

#### 🟡 **2. O(log n) - Logarithmic Time**
Extremely efficient. Even if the data doubles, operations only increase by 1. Data is halved at every step.
- **Example:** Using a phonebook. Looking for "Smith". You open to the middle ("M"), realize "S" is in the second half, rip the book in half, and repeat. You find it very fast.
- **Commonly found in:** Binary Search.

#### 🟠 **3. O(n) - Linear Time**
The time required scales completely linearly with the input data. If data goes up 10x, time goes up 10x.
- **Example:** Reading every single page of a book one by one until you find a specific quote.
```python
def find_number(arr, target):
    for num in arr:
        if num == target:
            return True # Has to check every single item at worst
```

#### 🔴 **4. O(n²) - Quadratic Time**
Terrible efficiency. The time it takes squares as the input increases. If data increases 10x, time taken increases 100x.
- **Example:** A nested loop. Having 10 people in a room shake hands with every other person in the room (90 handshakes).
```python
def print_pairs(arr):
    for i in arr:
        for j in arr: # Loop inside a loop!
            print(i, j) 
```
- **Commonly found in:** Inefficient sorting algorithms like Bubble Sort.

---
### 🛠️ **Summary Rule of Thumb**
When writing software architecture, we always try to avoid O(n²) and optimize towards **O(log n)** and **O(n)** where possible! It's the difference between your app taking 0.1 seconds vs 300 years to query a database of millions of users!
""",
         "citations": ["Algorithm Complexities", "Performance Optimization"]
    }
}

class DoubtRequest(BaseModel):
    student_id: str
    question_text: str
    image_url: Optional[str] = None


@app.post("/solve-doubt")
def solve_doubt(request: DoubtRequest):
    # Check for hardcoded OSI Model query
    try:
        # Check System Settings for Exam Mode
        settings_doc = db.collection("system").document("settings").get()
        if settings_doc.exists and settings_doc.to_dict().get("exam_mode", False):
             return {
                "answer": "⚠️ Exam Mode is Active. 'Ask Manan' is temporarily disabled.",
                "citations": []
            }
    except:
        pass # Fail open if DB error, or log it

    user_question = request.question_text.lower().strip()

    if "osi" in user_question:
        return {
            "answer": OSI_MODEL_RESPONSE,
            "citations": ["Networking Standards", "ISO Model"]
        }

    # Custom Fuzzy Matching for Hardcoded Suggestions
    best_match_key = None
    best_match_score = 0
    
    # We use fuzz.token_set_ratio because it handles extra words or slightly jumbled order well
    for key in SUGGESTED_DOUBTS.keys():
        score = fuzz.token_set_ratio(user_question, key.lower())
        if score > best_match_score:
            best_match_score = score
            best_match_key = key
            
    # threshold tuning: 80% similarity threshold
    if best_match_score >= 80 and best_match_key:
        return {
            "answer": SUGGESTED_DOUBTS[best_match_key]["text"],
            "citations": SUGGESTED_DOUBTS[best_match_key]["citations"]
        }

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


@app.post("/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    filename = file.filename.lower()
    
    # Simulate AI processing time
    import asyncio
    await asyncio.sleep(3.5)
    
    # Yash Vardhan Singh Profile
    if "yash" in filename:
        return {
            "score": 72,
            "details": {
                "candidate_name": "Yash Vardhan Singh",
                "role": "Entry-Level Software Developer / ML Engineer (Fresher)",
                "category_scores": [
                    {"name": "ATS Compatibility", "score": 78},
                    {"name": "Keyword Optimization", "score": 70},
                    {"name": "Technical Strength", "score": 75},
                    {"name": "Impact & Metrics", "score": 60},
                    {"name": "Formatting & Structure", "score": 77}
                ],
                "keywords": {
                    "strong": ["Python", "Data Structures and Algorithms", "OOP", "Deep Learning", "TensorFlow / Keras", "CNN", "OpenCV", "NumPy"],
                    "missing": ["Machine Learning", "Model Accuracy (%)", "REST APIs", "Git / GitHub", "SQL", "Deployment", "Flask / FastAPI", "AWS / Cloud"]
                },
                "recommendation": "Add measurable ML metrics (accuracy, precision, recall) and mention version control & deployment exposure.",
                "technical_skills": {
                    "strengths": ["Strong alignment with ML domain (CNN, TensorFlow)", "Multi-language exposure (Python, C, Java)", "Clear project tech stack mentioned", "Internship experience included"],
                    "gaps": ["No frameworks for backend development", "No mention of Git or collaboration tools", "No database skills mentioned", "Deep Learning listed but not quantified"]
                },
                "projects": [
                    {
                        "name": "DL-Based Crop Disease Detector",
                        "strengths": ["Domain-specific ML project (agriculture + drones)", "Proper tech stack defined", "Clear role mentioned"],
                        "improvements": ["Add dataset size (e.g., 5,000+ images)", "Add model accuracy (e.g., 92% validation accuracy)", "Mention performance improvements or real-world impact", "Add GitHub/project link"]
                    }
                ],
                "experience_review": {
                    "points": [
                        "Internship experience is good for a fresher but lacks quantifiable metrics.",
                        "Impact statements are generic."
                    ],
                    "recommendation": "Quantify contribution (e.g., supported hiring for 15+ roles) and mention specific tools used."
                },
                "ats_formatting": [
                    {"check": "Tables Used", "status": "No", "icon": "❌"},
                    {"check": "Personal Details", "status": "Not required", "icon": "⚠️"},
                    {"check": "Clean Headings", "status": "Yes", "icon": "✅"},
                    {"check": "Contact Info Proper", "status": "Yes", "icon": "✅"},
                    {"check": "File Format", "status": "Good", "icon": "✅"}
                ]
            }
        }

    # Default: Mahi Maurya Profile
    return {
        "score": 78,
        "details": {
            "candidate_name": "Mahi Maurya",
            "role": "Software Development Engineer (SDE – Entry Level)",
            "category_scores": [
                {"name": "ATS Compatibility", "score": 85},
                {"name": "Keyword Optimization", "score": 72},
                {"name": "Technical Strength", "score": 80},
                {"name": "Impact & Metrics", "score": 65},
                {"name": "Formatting & Structure", "score": 88}
            ],
            "keywords": {
                "strong": ["Java", "Python", "Data Structures & Algorithms", "OOP", "DBMS", "SQL", "Git / GitHub", "Blockchain"],
                "missing": ["REST APIs", "System Design", "Multithreading", "Spring Boot", "Docker", "CI/CD", "Agile / Scrum"]
            },
            "recommendation": "Add backend-specific and deployment-related keywords to improve match rate for product-based companies.",
            "technical_skills": {
                "strengths": ["Strong foundation in DSA", "Multi-language exposure (Java, Python, C)", "Basic frontend familiarity", "Blockchain project experience"],
                "gaps": ["No frameworks mentioned (Spring, Django, React)", "No cloud technologies (AWS, Azure, GCP)", "No deployment/project hosting links"]
            },
            "projects": [
                {
                    "name": "FoodChain Tracker (Blockchain System)",
                    "strengths": ["Demonstrates exposure to decentralized systems", "Shows frontend + backend integration understanding"],
                    "improvements": ["Add tech stack explicitly (e.g., Ethereum, Solidity, Node.js)", "Quantify impact (e.g., reduced tracking time by X%)"]
                },
                {
                    "name": "DSA Suite – Java",
                    "strengths": ["Strong alignment with SDE preparation", "Mentions optimized implementations"],
                    "improvements": ["Add GitHub repository link", "Include complexity analysis (O(n), O(log n))", "Mention notable problem types (graphs, DP, etc.)"]
                }
            ],
            "experience_review": {
                "points": [
                    "No internships or industry experience listed.",
                    "Achievements section is good but not impact-driven."
                ],
                "recommendation": "Convert generic statements into measurable outcomes. Example: Instead of 'Solved 100+ DSA problems', use 'Solved 100+ DSA problems across arrays, trees, and sorting, improving problem-solving efficiency by 30%.'"
            },
            "ats_formatting": [
                {"check": "Tables Used", "status": "No", "icon": "❌"},
                {"check": "Images Used", "status": "No", "icon": "❌"},
                {"check": "Clean Headings", "status": "Yes", "icon": "✅"},
                {"check": "Proper Section Order", "status": "Yes", "icon": "✅"},
                {"check": "File Format (PDF)", "status": "Recommended", "icon": "✅"}
            ]
        }
    }


# ─── Student Profile ──────────────────────────────────────────────────────────

@app.get("/student/profile")
def get_student_profile(uid: str = "student_1"):
    """Fetch a student profile from Firestore by UID."""
    try:
        doc = db.collection("users").document(uid).get()
        if doc.exists:
            data = doc.to_dict()
            profile = data.get("profile", {})
            stats = data.get("academic_stats", {})
            return {
                "uid": data.get("uid", uid),
                "name": profile.get("name", ""),
                "email": data.get("email", ""),
                "phone": data.get("phone", ""),
                "branch": profile.get("branch", ""),
                "year": profile.get("year", ""),
                "semester": data.get("semester", ""),
                "enrollment_no": data.get("enrollment_no", ""),
                "role": data.get("role", "student"),
                "cgpa": stats.get("cgpa", 0),
                "attendance": stats.get("attendance_percent", stats.get("attendance", 0)),
                "risk_status": stats.get("risk_status", stats.get("status", "safe")),
                "courses_enrolled": stats.get("courses_enrolled", []),
                "github_url": data.get("github_url", ""),
                "linkedin_url": data.get("linkedin_url", ""),
                "avatar_url": profile.get("avatar_url", profile.get("avatar", "")),
            }
        else:
            # Return empty profile template if user not found
            return {
                "uid": uid,
                "name": "",
                "email": "",
                "phone": "",
                "branch": "",
                "year": "",
                "semester": "",
                "enrollment_no": "",
                "role": "student",
                "cgpa": 0,
                "attendance": 0,
                "risk_status": "safe",
                "courses_enrolled": [],
                "github_url": "",
                "linkedin_url": "",
                "avatar_url": "",
            }
    except Exception as e:
        return {"error": str(e)}


class ProfileUpdateRequest(BaseModel):
    uid: str = "student_1"
    name: str = ""
    email: str = ""
    phone: str = ""
    branch: str = ""
    year: int = 0
    semester: str = ""
    enrollment_no: str = ""
    cgpa: float = 0.0
    attendance: float = 0.0
    github_url: str = ""
    linkedin_url: str = ""


@app.put("/student/profile")
def update_student_profile(req: ProfileUpdateRequest):
    """Update a student profile in Firestore."""
    try:
        doc_ref = db.collection("users").document(req.uid)
        
        # Determine risk status
        risk_status = "At Risk" if req.attendance < 75 or req.cgpa < 5.0 else "Safe"

        doc_ref.set({
            "uid": req.uid,
            "email": req.email,
            "phone": req.phone,
            "role": "student",
            "enrollment_no": req.enrollment_no,
            "semester": req.semester,
            "github_url": req.github_url,
            "linkedin_url": req.linkedin_url,
            "profile": {
                "name": req.name,
                "branch": req.branch,
                "year": req.year,
                "avatar_url": "",
            },
            "academic_stats": {
                "attendance_percent": req.attendance,
                "cgpa": req.cgpa,
                "risk_status": risk_status,
                "courses_enrolled": [],
            },
        }, merge=True)

        return {"status": "success", "message": "Profile updated successfully", "risk_status": risk_status}
    except Exception as e:
        return {"status": "error", "message": str(e)}


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


# ─── Courses & Enrollment ─────────────────────────────────────────────────────

class CourseCreateRequest(BaseModel):
    title: str
    description: str
    teacher_id: str
    teacher_name: str
    token: str  # For simple auth verification


@app.post("/courses")
def create_course(req: CourseCreateRequest):
    try:
        # verify token (simple check)
        decoded = auth.verify_id_token(req.token)
        if decoded["uid"] != req.teacher_id:
            return {"status": "error", "message": "Unauthorized"}

        from firebase_config import db
        
        course_data = {
            "title": req.title,
            "description": req.description,
            "teacher_id": req.teacher_id,
            "teacher_name": req.teacher_name,
            "created_at": firestore.SERVER_TIMESTAMP,
            "student_count": 0
        }
        
        update_time, course_ref = db.collection("courses").add(course_data)
        
        return {"status": "success", "course_id": course_ref.id}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.delete("/courses/{course_id}")
def delete_course(course_id: str, token: str):
    try:
        decoded = auth.verify_id_token(token)
        uid = decoded["uid"]
        
        from firebase_config import db
        course_ref = db.collection("courses").document(course_id)
        course_doc = course_ref.get()
        
        if not course_doc.exists:
             return {"status": "error", "message": "Course not found"}
             
        course_data = course_doc.to_dict()
        if course_data.get("teacher_id") != uid:
             return {"status": "error", "message": "Unauthorized"}

        course_ref.delete()
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/courses")
def get_courses():
    try:
        from firebase_config import db
        docs = db.collection("courses").stream()
        courses = []
        for doc in docs:
            d = doc.to_dict()
            d["id"] = doc.id
            # Convert timestamp to string if present
            if "created_at" in d and d["created_at"]:
                d["created_at"] = str(d["created_at"])
            courses.append(d)
        return {"courses": courses}
    except Exception as e:
        return {"status": "error", "message": str(e)}



@app.get("/courses/{course_id}")
def get_single_course(course_id: str):
    """Fetch a single course by ID, including syllabus_topics."""
    try:
        doc = db.collection("courses").document(course_id).get()
        if not doc.exists:
            return {"status": "error", "message": "Course not found"}
        d = doc.to_dict()
        d["id"] = doc.id
        if "created_at" in d and d["created_at"]:
            d["created_at"] = str(d["created_at"])
        return {"status": "success", "course": d}
    except Exception as e:
        return {"status": "error", "message": str(e)}


class EnrollRequest(BaseModel):
    student_id: str
    course_id: str
    token: str


@app.post("/courses/enroll")
async def enroll_student(req: EnrollRequest):
    try:
        decoded = auth.verify_id_token(req.token)
        if decoded["uid"] != req.student_id:
             return {"status": "error", "message": "Unauthorized"}

        from firebase_config import db

        # 1. Add student to course subcollection
        course_ref = db.collection("courses").document(req.course_id)
        course_ref.collection("students").document(req.student_id).set({
            "enrolled_at": firestore.SERVER_TIMESTAMP,
            "uid": req.student_id
        })

        # 2. Add course to student's enrolled_courses subcollection
        user_ref = db.collection("users").document(req.student_id)
        user_ref.collection("enrolled_courses").document(req.course_id).set({
            "enrolled_at": firestore.SERVER_TIMESTAMP,
            "course_id": req.course_id
        })
        
        # 3. Increment student count (optional/atomic)
        # course_ref.update({"student_count": firestore.Increment(1)})

        return {"status": "success"}

    except Exception as e:
        return {"status": "error", "message": str(e)}


class TeacherRosterRequest(BaseModel):
    teacher_id: str
    token: str


@app.post("/teacher/students")
def get_teacher_students(req: TeacherRosterRequest):
    try:
        decoded = auth.verify_id_token(req.token)
        # Allow if requester is the teacher
        
        from firebase_config import db
        
        # 1. Get all courses by this teacher
        courses_query = db.collection("courses").where("teacher_id", "==", req.teacher_id).stream()
        
        student_uids = set()
        
        # 2. For each course, get enrolled students
        for course in courses_query:
            students_ref = course.reference.collection("students").stream()
            for s in students_ref:
                student_uids.add(s.id)
        
        if not student_uids:
            return {"students": []}

        # 3. Fetch user profiles for these students
        # Firestore 'in' query supports max 10/30 items, so might need chunking or individual fetches
        # For simplicity, fetching individually for now (ok for small scale)
        students_data = []
        for uid in student_uids:
            u_doc = db.collection("users").document(uid).get()
            if u_doc.exists:
                ud = u_doc.to_dict()
                # Determine display info
                students_data.append({
                    "id": uid,
                    "name": ud.get("email", "Unknown").split("@")[0], # Fallback name
                    "email": ud.get("email", ""),
                    "roll": "N/A", 
                    "branch": "N/A",
                    "year": "N/A",
                    "cgpa": 0.0,
                    "attendance": 0,
                    "avatar": (ud.get("email", "U")[0]).upper()
                })
        
        return {"students": students_data}

    except Exception as e:
        return {"status": "error", "message": str(e)}


# ─── Syllabus & Doubts ────────────────────────────────────────────────────────

class SyllabusUploadRequest(BaseModel):
    token: str
    file_url: str = None  # Optional if we just want to flag it for now

@app.post("/courses/{course_id}/syllabus")
def upload_syllabus(course_id: str, req: SyllabusUploadRequest):
    try:
        decoded = auth.verify_id_token(req.token)
        from firebase_config import db
        
        # Verify ownership (omitted for brevity, but recommended)
        
        db.collection("courses").document(course_id).update({
            "syllabus_uploaded": True,
            "syllabus_url": req.file_url or "https://example.com/syllabus.pdf" # Mock URL if none provided
        })
        
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


class DoubtRequest(BaseModel):
    course_id: str
    student_id: str
    question: str
    token: str

@app.post("/courses/doubts")
def ask_doubt(req: DoubtRequest):
    try:
        decoded = auth.verify_id_token(req.token)
        if decoded["uid"] != req.student_id:
             return {"status": "error", "message": "Unauthorized"}

        student_email = decoded.get("email", "Unknown")

        doubt_data = {
            "course_id": req.course_id,
            "student_id": req.student_id,
            "student_email": student_email,
            "question": req.question,
            "status": "open",
            "created_at": firestore.SERVER_TIMESTAMP
        }

        # Add to global 'doubts' collection
        _, doubt_ref = db.collection("doubts").add(doubt_data)

        # Increment doubt count on course
        course_ref = db.collection("courses").document(req.course_id)
        course_doc = course_ref.get()
        course_title = "Unknown Course"
        teacher_id = None
        if course_doc.exists:
            cd = course_doc.to_dict()
            course_title = cd.get("title", course_title)
            teacher_id = cd.get("teacher_id")
            course_ref.update({"doubts_count": firestore.Increment(1)})

        # Create a notification for the faculty
        notif_data = {
            "title": f"New doubt in {course_title}: \"{req.question[:80]}...\"",
            "type": "info",
            "sender_uid": req.student_id,
            "sender_email": student_email,
            "target_uid": teacher_id,
            "doubt_id": doubt_ref.id,
            "course_id": req.course_id,
            "created_at": firestore.SERVER_TIMESTAMP,
        }
        db.collection("notifications").add(notif_data)

        return {"status": "success", "doubt_id": doubt_ref.id}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/courses/{course_id}/doubts")
def get_course_doubts(course_id: str, student_id: str = Query(default=None)):
    """Get doubts for a specific course, optionally filtered by student_id."""
    try:
        query = db.collection("doubts").where("course_id", "==", course_id)
        if student_id:
            query = query.where("student_id", "==", student_id)

        docs = query.stream()
        doubts = []
        for doc in docs:
            d = doc.to_dict()
            d["id"] = doc.id
            if d.get("created_at"):
                d["created_at"] = d["created_at"].isoformat()
            doubts.append(d)
        # Sort by created_at descending (newest first)
        doubts.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return {"status": "success", "doubts": doubts}
    except Exception as e:
        return {"status": "error", "message": str(e)}


class ResolveDoubtRequest(BaseModel):
    token: str
    answer: str = ""

@app.put("/doubts/{doubt_id}/resolve")
def resolve_doubt(doubt_id: str, req: ResolveDoubtRequest):
    """Faculty marks a doubt as resolved."""
    try:
        decoded = auth.verify_id_token(req.token)
        uid = decoded["uid"]

        # Verify the user is admin/teacher
        user_doc = db.collection("users").document(uid).get()
        if not user_doc.exists or user_doc.to_dict().get("role") != "admin":
            return {"status": "error", "message": "Unauthorized – admin only"}

        doubt_ref = db.collection("doubts").document(doubt_id)
        doubt_doc = doubt_ref.get()
        if not doubt_doc.exists:
            return {"status": "error", "message": "Doubt not found"}

        update = {"status": "resolved", "resolved_at": firestore.SERVER_TIMESTAMP, "resolved_by": uid}
        if req.answer:
            update["faculty_answer"] = req.answer
        doubt_ref.update(update)

        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


class AdminDoubtsRequest(BaseModel):
    teacher_id: str
    token: str

@app.post("/admin/doubts")
def get_admin_doubts(req: AdminDoubtsRequest):
    """Get all open doubts across courses taught by this teacher."""
    try:
        decoded = auth.verify_id_token(req.token)

        # 1. Get all courses taught by this teacher
        courses_query = db.collection("courses").where("teacher_id", "==", req.teacher_id).stream()
        course_map = {}
        for c in courses_query:
            cd = c.to_dict()
            course_map[c.id] = cd.get("title", "Unknown")

        if not course_map:
            return {"status": "success", "doubts": []}

        # 2. Get all open doubts and filter by teacher's courses
        all_doubts = db.collection("doubts").where("status", "==", "open").stream()
        doubts = []
        for doc in all_doubts:
            d = doc.to_dict()
            if d.get("course_id") in course_map:
                d["id"] = doc.id
                d["course_title"] = course_map[d["course_id"]]
                if d.get("created_at"):
                    d["created_at"] = d["created_at"].isoformat()
                doubts.append(d)

        # Sort by created_at descending (newest first)
        doubts.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return {"status": "success", "doubts": doubts}
    except Exception as e:
        return {"status": "error", "message": str(e)}



class AdminStudentsRequest(BaseModel):
    token: str

@app.post("/admin/students")
def get_all_students(req: AdminStudentsRequest):
    """Fetch all users with role='student' including their stats."""
    try:
        decoded = auth.verify_id_token(req.token)
        # Verify admin
        user_doc = db.collection("users").document(decoded["uid"]).get()
        if not user_doc.exists or user_doc.to_dict().get("role") != "admin":
             return {"status": "error", "message": "Unauthorized"}
        
        docs = db.collection("users").where("role", "==", "student").stream()
        students = []
        for doc in docs:
            d = doc.to_dict()
            student = {
                "id": doc.id,
                "uid": d.get("uid"),
                "email": d.get("email"),
                "name": d.get("profile", {}).get("name", "Unknown"),
                "roll": d.get("profile", {}).get("roll_number", "N/A"), # Assuming roll exists or N/A
                "academic_stats": d.get("academic_stats", {}),
                "created_at": str(d.get("created_at", ""))
            }
            students.append(student)
            
        return {"status": "success", "students": students}
    except Exception as e:
        return {"status": "error", "message": str(e)}


class BatchNotifyRequest(BaseModel):
    token: str
    student_ids: List[str]
    title: str
    type: str = "info" # info, urgent, warning, success

@app.post("/admin/notify/batch")
def batch_notify(req: BatchNotifyRequest):
    """Send a notification to multiple students."""
    try:
        decoded = auth.verify_id_token(req.token)
        # Verify admin
        user_doc = db.collection("users").document(decoded["uid"]).get()
        if not user_doc.exists or user_doc.to_dict().get("role") != "admin":
             return {"status": "error", "message": "Unauthorized"}
        
        batch = db.batch()
        count = 0
        for uid in req.student_ids:
            ref = db.collection("notifications").document()
            batch.set(ref, {
                "title": req.title,
                "type": req.type,
                "target_uid": uid,
                "sender_uid": decoded["uid"],
                "created_at": firestore.SERVER_TIMESTAMP,
                "read": False
            })
            count += 1
            
        batch.commit()
        return {"status": "success", "count": count}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ─── Quiz Generator ───────────────────────────────────────────────────────────

class QuizRequest(BaseModel):
    subject: str
    topic: str
    difficulty: str = "Medium"

@app.post("/generate-quiz")
def generate_quiz(req: QuizRequest):
    # Hardcoded quiz as requested by user
    hardcoded_quiz = [
        {
            "question": "Which data structure follows the FIFO (First In, First Out) principle?",
            "options": ["Stack", "Queue", "Tree", "Graph"],
            "answer": "Queue",
            "explanation": "A Queue follows the FIFO principle, where the first element added is the first one to be removed."
        },
        {
            "question": "What is the time complexity of searching for an element in a balanced Binary Search Tree (BST)?",
            "options": ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
            "answer": "O(log n)",
            "explanation": "In a balanced BST, the height is log(n), so searching takes O(log n) time."
        },
        {
            "question": "Which data structure is primarily used to implement recursion?",
            "options": ["Queue", "Heap", "Stack", "Linked List"],
            "answer": "Stack",
            "explanation": "Recursion uses the Call Stack to keep track of function calls."
        },
        {
            "question": "What is the worst-case time complexity of Quick Sort?",
            "options": ["O(n log n)", "O(log n)", "O(n²)", "O(n)"],
            "answer": "O(n²)",
            "explanation": "The worst case occurs when the pivot is the smallest or largest element, leading to O(n²)."
        },
        {
            "question": "In a hash table, what technique is used to handle collisions?",
            "options": ["Traversal", "Backtracking", "Chaining", "Recursion"],
            "answer": "Chaining",
            "explanation": "Chaining handles collisions by storing multiple elements at the same index using a list or another data structure."
        }
    ]
    
    return {"status": "success", "quiz": hardcoded_quiz}


# ─── Admin Stats ──────────────────────────────────────────────────────────────

class AdminStatsRequest(BaseModel):
    teacher_id: str
    token: str

@app.post("/admin/stats")
def get_admin_stats(req: AdminStatsRequest):
    try:
        decoded = auth.verify_id_token(req.token)
        
        from firebase_config import db
        
        # 1. Active Courses
        courses_query = db.collection("courses").where("teacher_id", "==", req.teacher_id).stream()
        course_ids = []
        for c in courses_query:
            course_ids.append(c.id)
            
        active_courses_count = len(course_ids)
        
        # 2. Total Students (Unique)
        student_uids = set()
        for cid in course_ids:
            students = db.collection("courses").document(cid).collection("students").stream()
            for s in students:
                student_uids.add(s.id)
        
        total_students_count = len(student_uids)
        
        # 3. Unsolved Doubts
        # Query doubts where course_id IN course_ids AND status == 'open'
        # Firestore 'in' limit is 10. If > 10 courses, this simple query fails.
        # Fallback: Query all 'open' doubts and filter in python (not scalable but works for prototype)
        unsolved_doubts_count = 0
        if course_ids:
           # Optimization: If many courses, maybe query by course_id individually or rethink schema.
           # For now, let's just count all doubts for these courses.
           all_doubts = db.collection("doubts").where("status", "==", "open").stream()
           for d in all_doubts:
               if d.to_dict().get("course_id") in course_ids:
                   unsolved_doubts_count += 1

        return {
            "total_students": total_students_count,
            "active_courses": active_courses_count,
            "unsolved_doubts": unsolved_doubts_count,
            # Mocking attendance for now as we don't track it yet
            "avg_attendance": 85 
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ─── Notifications ────────────────────────────────────────────────────────────

class NotificationCreateRequest(BaseModel):
    token: str
    title: str
    type: str = "info"  # urgent, info, success, warning


@app.post("/notifications")
def create_notification(req: NotificationCreateRequest):
    """Admin sends a notification to all students."""
    try:
        decoded = auth.verify_id_token(req.token)
        uid = decoded["uid"]

        # Verify sender is admin
        user_doc = db.collection("users").document(uid).get()
        if not user_doc.exists or user_doc.to_dict().get("role") != "admin":
            return {"status": "error", "message": "Unauthorized – admin only"}

        if req.type not in ("urgent", "info", "success", "warning"):
            return {"status": "error", "message": "Invalid type"}

        notif_data = {
            "title": req.title,
            "type": req.type,
            "sender_uid": uid,
            "sender_email": decoded.get("email", ""),
            "created_at": firestore.SERVER_TIMESTAMP,
        }

        _, doc_ref = db.collection("notifications").add(notif_data)
        return {"status": "success", "id": doc_ref.id}

    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/notifications")
def get_notifications(limit: int = 20):
    """Fetch recent notifications for students."""
    try:
        docs = (
            db.collection("notifications")
            .order_by("created_at", direction=firestore.Query.DESCENDING)
            .limit(limit)
            .stream()
        )
        results = []
        for doc in docs:
            d = doc.to_dict()
            d["id"] = doc.id
            if d.get("created_at"):
                d["created_at"] = d["created_at"].isoformat()
            results.append(d)
        return {"status": "success", "notifications": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ─── Placement Preparation ────────────────────────────────────────────────────

@app.get("/placement-drives")
def get_placement_drives():
    """Return a list of upcoming placement drives (demo data)."""
    drives = [
        {
            "company": "Google",
            "role": "SDE Intern",
            "date": "March 5, 2026",
            "location": "Bangalore, India",
            "cgpa": "8.0+",
            "status": "upcoming",
        },
        {
            "company": "Amazon",
            "role": "SDE-1",
            "date": "March 12, 2026",
            "location": "Hyderabad, India",
            "cgpa": "7.0+",
            "status": "upcoming",
        },
        {
            "company": "Microsoft",
            "role": "Software Engineer",
            "date": "March 20, 2026",
            "location": "Noida, India",
            "cgpa": "7.5+",
            "status": "upcoming",
        },
        {
            "company": "Flipkart",
            "role": "SDE Intern",
            "date": "Feb 28, 2026",
            "location": "Bangalore, India",
            "cgpa": "7.0+",
            "status": "ongoing",
        },
        {
            "company": "Infosys",
            "role": "Systems Engineer",
            "date": "Feb 10, 2026",
            "location": "Pune, India",
            "cgpa": "6.0+",
            "status": "completed",
        },
    ]
    return {"status": "success", "drives": drives}


class PlacementProgressRequest(BaseModel):
    student_id: str
    topic_progress: dict = {}
    daily_goals: dict = {}
    company_checks: dict = {}
    streak: int = 0


@app.post("/placement-progress")
def save_placement_progress(req: PlacementProgressRequest):
    """Save or retrieve placement preparation progress for a student."""
    try:
        doc_ref = db.collection("placement_progress").document(req.student_id)

        if req.topic_progress or req.daily_goals or req.company_checks:
            # Save progress
            doc_ref.set({
                "topic_progress": req.topic_progress,
                "daily_goals": req.daily_goals,
                "company_checks": req.company_checks,
                "streak": req.streak,
                "updated_at": firestore.SERVER_TIMESTAMP,
            }, merge=True)
            return {"status": "success", "message": "Progress saved"}
        else:
            # Retrieve progress
            doc = doc_ref.get()
            if doc.exists:
                data = doc.to_dict()
                if "updated_at" in data and data["updated_at"]:
                    data["updated_at"] = str(data["updated_at"])
                return {"status": "success", "data": data}
            return {"status": "success", "data": {}}

    except Exception as e:
        return {"status": "error", "message": str(e)}


# ─── System Settings ──────────────────────────────────────────────────────────

@app.get("/admin/settings")
def get_system_settings():
    try:
        doc = db.collection("system").document("settings").get()
        if doc.exists:
            return {"status": "success", "settings": doc.to_dict()}
        else:
            # Return defaults
            defaults = {
                "maintenance_mode": False,
                "exam_mode": False,
                "attendance_threshold": 75,
                "cgpa_threshold": 5.0
            }
            return {"status": "success", "settings": defaults}
    except Exception as e:
        return {"status": "error", "message": str(e)}

class SystemSettingsRequest(BaseModel):
    token: str
    maintenance_mode: bool
    exam_mode: bool
    attendance_threshold: float
    cgpa_threshold: float

@app.post("/admin/settings")
def update_system_settings(req: SystemSettingsRequest):
    try:
        decoded = auth.verify_id_token(req.token)
        # Verify admin
        user_doc = db.collection("users").document(decoded["uid"]).get()
        if not user_doc.exists or user_doc.to_dict().get("role") != "admin":
             return {"status": "error", "message": "Unauthorized"}
            
        db.collection("system").document("settings").set({
            "maintenance_mode": req.maintenance_mode,
            "exam_mode": req.exam_mode,
            "attendance_threshold": req.attendance_threshold,
            "cgpa_threshold": req.cgpa_threshold,
            "updated_at": firestore.SERVER_TIMESTAMP,
            "updated_by": decoded["uid"]
        }, merge=True)
        
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
