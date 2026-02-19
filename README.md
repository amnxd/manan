# Manan

Manan is an AI-based Academic Assistant platform designed to help students and faculty with academic insights, risk prediction, and career guidance.

## Project Structure

```
manan/
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

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/amnxd/manan.git
cd manan
```

---

### 2. Backend Setup (`apps/api`)

The backend is built with FastAPI and handles AI logic and database interactions.

**Terminal 1:**

```bash
cd apps/api
```

#### Create & Activate Virtual Environment

```bash
# Windows
python -m venv venv
```

**Windows (CMD/PowerShell):**
```bash
.\venv\Scripts\activate
```

**Windows (Git Bash):**
```bash
source venv/Scripts/activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

#### Install Dependencies

```bash
pip install -r requirements.txt
```

#### Environment Variables
Create a `.env` file in `apps/api/` with your Google Gemini API Key:
```env
GOOGLE_API_KEY=your_google_ai_api_key
```

#### Run the Server

```bash
uvicorn main:app --reload
```
*Server running at: http://127.0.0.1:8000*

---

### 3. Frontend Setup (`apps/web`)

The frontend is a Next.js application.

**Terminal 2:**

```bash
cd apps/web
```

#### Install Dependencies

```bash
npm install
```

#### Environment Variables
Create a `.env.local` file in `apps/web/` with your Firebase config:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

#### Run the Web App

```bash
npm run dev
```
*Web App running at: http://localhost:3000*

---

## Features & Usage

| URL | Description |
|---|---|
| `/signup` | Create a new account |
| `/login` | Sign in |
| `/dashboard` | Student dashboard |
| `/admin` | Admin dashboard |

- **Students** should sign up with a `@bbdu.ac.in` email (optional, configurable).
- **Admins** have access to analytics and risk reports.
