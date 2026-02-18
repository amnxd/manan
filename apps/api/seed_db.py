"""
seed_db.py — Populate Firestore with realistic test data for Nova Scholar.

Usage:
    python seed_db.py

Requires:
    - service-account.json in the same directory (or set FIREBASE_SERVICE_ACCOUNT_PATH env var)
    - firebase-admin installed  (pip install firebase-admin)
"""

import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

# ─── Firebase Init ────────────────────────────────────────────────────────────

def get_db() -> firestore.Client:
    """Initialize Firebase Admin SDK and return a Firestore client."""
    if not firebase_admin._apps:
        service_account_path = os.getenv(
            "FIREBASE_SERVICE_ACCOUNT_PATH", "service-account.json"
        )
        if not os.path.exists(service_account_path):
            raise FileNotFoundError(
                f"Service account file not found at '{service_account_path}'.\n"
                "Place your service-account.json in apps/api/ or set the "
                "FIREBASE_SERVICE_ACCOUNT_PATH environment variable."
            )
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
        print(f"✅ Firebase Admin initialized with: {service_account_path}")
    return firestore.client()


# ─── Seed Data ────────────────────────────────────────────────────────────────

ADMIN_USER = {
    "uid": "admin_seed_001",
    "email": "admin@novascholar.edu",
    "role": "admin",
    "profile": {
        "name": "Dr. Priya Sharma",
        "branch": "CSE",
        "year": 0,          # 0 = faculty / admin
    },
    "stats": {
        "attendance": 100,
        "cgpa": 10.0,
        "risk_score": 0,
    },
}

# 10 students — first 3 are "At Risk" (attendance < 75 OR cgpa < 5.0)
STUDENT_USERS = [
    # ── At-Risk Students ──────────────────────────────────────────────────────
    {
        "uid": "student_seed_001",
        "email": "rahul.v@novascholar.edu",
        "role": "student",
        "profile": {"name": "Rahul Verma",    "branch": "CSE", "year": 3},
        "stats": {"attendance": 58, "cgpa": 4.2, "risk_score": 85},   # low attendance + low cgpa
    },
    {
        "uid": "student_seed_002",
        "email": "sneha.p@novascholar.edu",
        "role": "student",
        "profile": {"name": "Sneha Patel",    "branch": "CSE", "year": 2},
        "stats": {"attendance": 70, "cgpa": 4.8, "risk_score": 78},   # borderline attendance + low cgpa
    },
    {
        "uid": "student_seed_003",
        "email": "arjun.k@novascholar.edu",
        "role": "student",
        "profile": {"name": "Arjun Kumar",    "branch": "CSE", "year": 3},
        "stats": {"attendance": 62, "cgpa": 6.1, "risk_score": 72},   # low attendance only
    },
    # ── Safe Students ─────────────────────────────────────────────────────────
    {
        "uid": "student_seed_004",
        "email": "ananya.m@novascholar.edu",
        "role": "student",
        "profile": {"name": "Ananya Mehta",   "branch": "CSE", "year": 3},
        "stats": {"attendance": 92, "cgpa": 8.7, "risk_score": 12},
    },
    {
        "uid": "student_seed_005",
        "email": "vikram.s@novascholar.edu",
        "role": "student",
        "profile": {"name": "Vikram Singh",   "branch": "CSE", "year": 2},
        "stats": {"attendance": 88, "cgpa": 7.9, "risk_score": 18},
    },
    {
        "uid": "student_seed_006",
        "email": "pooja.r@novascholar.edu",
        "role": "student",
        "profile": {"name": "Pooja Rao",      "branch": "CSE", "year": 4},
        "stats": {"attendance": 95, "cgpa": 9.1, "risk_score": 5},
    },
    {
        "uid": "student_seed_007",
        "email": "karan.g@novascholar.edu",
        "role": "student",
        "profile": {"name": "Karan Gupta",    "branch": "CSE", "year": 3},
        "stats": {"attendance": 80, "cgpa": 7.2, "risk_score": 30},
    },
    {
        "uid": "student_seed_008",
        "email": "divya.n@novascholar.edu",
        "role": "student",
        "profile": {"name": "Divya Nair",     "branch": "CSE", "year": 2},
        "stats": {"attendance": 87, "cgpa": 8.0, "risk_score": 20},
    },
    {
        "uid": "student_seed_009",
        "email": "rohan.j@novascholar.edu",
        "role": "student",
        "profile": {"name": "Rohan Joshi",    "branch": "CSE", "year": 4},
        "stats": {"attendance": 91, "cgpa": 8.5, "risk_score": 10},
    },
    {
        "uid": "student_seed_010",
        "email": "meera.c@novascholar.edu",
        "role": "student",
        "profile": {"name": "Meera Chandra",  "branch": "CSE", "year": 3},
        "stats": {"attendance": 83, "cgpa": 7.6, "risk_score": 25},
    },
]

COURSES = [
    {
        "id": "CS301",
        "title": "Operating Systems",
        "professor": "Dr. Amit Tiwari",
        "total_classes": 48,
        "topics": [
            "Processes & Threads",
            "CPU Scheduling",
            "Memory Management",
            "Virtual Memory",
            "File Systems",
            "Deadlocks",
            "I/O Systems",
        ],
    },
    {
        "id": "CS302",
        "title": "Database Management Systems",
        "professor": "Dr. Sunita Rao",
        "total_classes": 45,
        "topics": [
            "Relational Model",
            "SQL & Queries",
            "Normalization",
            "Transactions & ACID",
            "Indexing & B-Trees",
            "NoSQL Databases",
            "Query Optimization",
        ],
    },
    {
        "id": "CS303",
        "title": "Computer Networks",
        "professor": "Prof. Ravi Menon",
        "total_classes": 42,
        "topics": [
            "OSI & TCP/IP Model",
            "Data Link Layer",
            "Network Layer & IP",
            "Routing Algorithms",
            "Transport Layer",
            "Application Layer",
            "Network Security",
        ],
    },
    {
        "id": "CS304",
        "title": "Artificial Intelligence",
        "professor": "Dr. Kavya Iyer",
        "total_classes": 50,
        "topics": [
            "Search Algorithms",
            "Knowledge Representation",
            "Propositional Logic",
            "Machine Learning Basics",
            "Neural Networks",
            "Natural Language Processing",
            "Reinforcement Learning",
        ],
    },
]


# ─── Helpers ──────────────────────────────────────────────────────────────────

def clear_collection(db: firestore.Client, collection_name: str) -> None:
    """Delete all documents in a Firestore collection (batch delete)."""
    col_ref = db.collection(collection_name)
    docs = col_ref.stream()
    batch = db.batch()
    count = 0
    for doc in docs:
        batch.delete(doc.reference)
        count += 1
        if count % 500 == 0:          # Firestore batch limit is 500
            batch.commit()
            batch = db.batch()
    if count % 500 != 0:
        batch.commit()
    print(f"  🗑️  Cleared {count} document(s) from '{collection_name}'.")


# ─── Main Seed Function ───────────────────────────────────────────────────────

def seed(clear_existing: bool = True) -> None:
    """Seed Firestore with users and courses."""
    db = get_db()

    # ── Optional: clear existing data ─────────────────────────────────────────
    if clear_existing:
        print("\n📦 Clearing existing collections...")
        clear_collection(db, "users")
        clear_collection(db, "courses")

    # ── Seed Users ────────────────────────────────────────────────────────────
    print("\n👤 Seeding users...")

    # Admin
    db.collection("users").document(ADMIN_USER["uid"]).set(ADMIN_USER)
    print(f"  ✅ Admin:   {ADMIN_USER['profile']['name']} ({ADMIN_USER['email']})")

    # Students
    at_risk_count = 0
    for student in STUDENT_USERS:
        db.collection("users").document(student["uid"]).set(student)
        is_at_risk = (
            student["stats"]["attendance"] < 75
            or student["stats"]["cgpa"] < 5.0
        )
        tag = "⚠️  AT-RISK" if is_at_risk else "✅ Safe    "
        if is_at_risk:
            at_risk_count += 1
        print(
            f"  {tag}  {student['profile']['name']:<18} "
            f"Attendance: {student['stats']['attendance']}%  "
            f"CGPA: {student['stats']['cgpa']}"
        )

    # ── Seed Courses ──────────────────────────────────────────────────────────
    print("\n📚 Seeding courses...")
    for course in COURSES:
        db.collection("courses").document(course["id"]).set(course)
        print(f"  ✅ [{course['id']}] {course['title']} — {course['professor']}")

    # ── Summary ───────────────────────────────────────────────────────────────
    print("\n" + "─" * 55)
    print("🎉 Seed complete!")
    print(f"   Users  : 1 admin + {len(STUDENT_USERS)} students ({at_risk_count} at-risk)")
    print(f"   Courses: {len(COURSES)}")
    print("─" * 55)


# ─── Entry Point ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    seed(clear_existing=True)
