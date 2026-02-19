# Nova Scholar

Nova Scholar is an AI-based Academic Assistant platform designed to help students and faculty with academic insights, risk prediction, and career guidance.

## Project Structure

```
nova_scholar/
├── apps/
│   ├── web/          # Next.js 16 frontend (App Router + Tailwind CSS)
│   └── api/          # FastAPI backend (Gemini AI, Firebase Auth)
└── packages/
    └── ai/           # AI research scripts
```

## Prerequisites

- **Node.js** v18+
- **Python** 3.10+
- **Firebase Project** with Email/Password auth enabled
- **Google AI API Key** (for Gemini features)

---

## 1. Clone the Repository

```bash
git clone https://github.com/amnxd/nova_scholar.git
cd nova_scholar
```

---

## 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Create a new project**
2. **Authentication** → **Sign-in method** → Enable **Email/Password**
3. **Project Settings** → **General** → Scroll to "Your apps" → Click **Add app** (Web `</>`) → Register the app → Copy the config
4. **Project Settings** → **Service accounts** → **Generate new private key** → Save the downloaded JSON file into `apps/api/` directory

---

## 3. Backend Setup (`apps/api`)

```bash
cd apps/api
```

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate Virtual Environment

**Windows:**
```bash
./venv/Scripts/activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configure Environment Variables

Create a `.env` file in `apps/api/`:

```env
GOOGLE_API_KEY=your_google_ai_api_key
```

### Update Service Account Path

In `main.py`, update the service account filename (line 17) to match your downloaded JSON file:

```python
_service_account_path = os.getenv(
    "FIREBASE_SERVICE_ACCOUNT_PATH",
    "your-project-firebase-adminsdk-xxxxx-xxxxxxxxxx.json"  # ← Update this
)
```

### Seed Database (Optional)

```bash
python seed_db.py
```

### Run the Backend

```bash
uvicorn main:app --reload
```

The API will be available at **http://127.0.0.1:8000**

---

## 4. Frontend Setup (`apps/web`)

Open a **new terminal**:

```bash
cd apps/web
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env.local` file in `apps/web/`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

> Replace the values with the config from your Firebase web app (Step 2).

### Run the Frontend

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

---

## 5. Usage

| URL | Description |
|---|---|
| `/signup` | Create a new account (Student or Admin) |
| `/login` | Sign in with email/password |
| `/dashboard` | Student dashboard |
| `/admin` | Admin/Faculty dashboard |

- **Students** must sign up with a `@bbdu.ac.in` email
- **Admins** can use any email address

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/auth/sync` | Sync user auth with Firestore |
| `POST` | `/solve-doubt` | Ask Nova AI (Gemini-powered) |
| `POST` | `/predict` | Academic risk prediction |
| `POST` | `/analyze-resume` | Resume ATS score analysis |
| `GET` | `/student/profile` | Get student profile |

---

## Tech Stack

- **Frontend**: Next.js 16, React, Tailwind CSS, Recharts
- **Backend**: FastAPI, Python
- **AI**: Google Gemini 2.0 Flash
- **Auth & DB**: Firebase Auth + Firestore
- **Deployment**: Uvicorn (dev server)
