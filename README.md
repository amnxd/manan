# Nova Scholar

An AI-based Academic Assistant.

## Project Structure

- `apps/web`: Frontend (Next.js 16, Tailwind CSS 4)
- `apps/api`: Backend (FastAPI, Python 3.12+)
- `packages/db`: Database configurations (PostgreSQL)
- `packages/ai`: shared AI logic (LangChain/Gemini)

## Getting Started

### Backend
1. Navigate to `apps/api`
2. Run `.\setup_venv.ps1` to setup environment and install dependencies.
3. Run `uvicorn main:app --reload` to start the server.

### Frontend
1. Navigate to `apps/web`
2. Run `npm install`
3. Run `npm run dev`
