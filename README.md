# Wayfare – AI Travel Itinerary Planner 🧭✈️

> **Production-grade, full-stack AI travel itinerary planner engineered with FastAPI, React + Vite + TypeScript, Supabase RLS migrations, Leaflet maps, Recharts budget analytics, and strict Pydantic v2 validation with swappable Gemini & Mock AI engines.**

---

## 🌟 Key Features

1. **3 Pre-Tuned Scenarios**:
   - **Solo Backpacker / Explorer**: Affordable, walkability-focused, solo ramen & cafe counters, subway transit guidance.
   - **Romantic Couple Getaway**: Scenic viewpoints, sunset Seine champagne cruise, candlelit bistros, relaxed mornings.
   - **Group Roadtrip / Vacation**: Member preference merging, group table reservations, split cost tracking, and collaborative roles.
2. **Interactive Day & Timeline Editor**:
   - **Drag-and-Drop Reordering**: Powered by `@dnd-kit` to dynamically re-sequence stops with automatic travel time recalculations.
   - **Lock / Protect Items**: Lock anchor attractions against replacement during day regenerations.
   - **3 AI Alternatives per Stop**: Suggests 3 realistic nearby replacements with cost comparison and 1-click swapping.
   - **Single Day Regeneration**: Custom prompt instructions (e.g. *"More outdoor photography and less shopping"*) while keeping locked items intact.
3. **Interactive Geo-Clustered Map**:
   - Built with **Leaflet**, featuring numbered category pin bubbles, connected transit route lines, and rich stop details popups.
4. **Live Cost Tracker & Analytics**:
   - **Recharts** visualizations: category spending bar/pie charts, daily spend breakdown, per-person share, and over-budget warnings.
5. **Group Collaboration & Preferences**:
   - Invite collaborators with roles (`owner`, `editor`, `viewer`), manage dietary restrictions, and track individual budget targets.
6. **Public Sharing & Multi-Format Exports**:
   - Read-only share link token (`/trip/share/:shareToken`) accessible without authentication.
   - Export to **iCalendar (.ICS)** for Apple/Google Calendar.
   - Export to **Printable / PDF format** with clean print styling.
7. **Swappable AI Engine with Zero-Key Mock Mode**:
   - **Mock Mode (`AI_MODE=mock`)**: Out of the box, runs completely offline with realistic POIs, neighborhood clusters, and meal timing logic.
   - **Gemini Mode (`AI_MODE=gemini`)**: Live Google Generative AI integration with strict JSON output validated by Pydantic.

---

## 🏗️ Architecture & Tech Stack

```
wayfare/
├── backend/            # FastAPI, Pydantic v2, JWT auth, AI provider
│   ├── app/
│   │   ├── models/     # Strict Pydantic v2 schemas
│   │   ├── routers/    # /api/v1 (trips, itinerary, members, share, auth)
│   │   ├── services/   # AI engine, DB service, cost tracker, ICS/PDF export
│   │   └── utils/      # Geo calculations, transit estimation, auth helpers
│   ├── tests/          # Pytest & automated API verification suite
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/           # React 18, Vite, TypeScript, Tailwind CSS
│   ├── src/
│   │   ├── components/ # Leaflet map, dnd-kit timeline, Recharts analytics, modals
│   │   ├── context/    # AuthContext (demo switcher), ThemeContext (dark/light)
│   │   ├── pages/      # Landing, Dashboard, Builder, Detail, Shared view
│   │   └── services/   # API client
│   ├── package.json
│   └── Dockerfile
├── supabase/
│   └── migrations/     # Full PostgreSQL schema with RLS security policies
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quickstart: Running Locally

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** and **npm**

---

### Step 1: Start the Backend (FastAPI)

```bash
cd backend

# (Optional) Create virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server (Default runs in MOCK AI mode without keys!)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend is now live at `http://127.0.0.1:8000`:
- Interactive Swagger docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

### Step 2: Start the Frontend (React + Vite)

In a separate terminal:

```bash
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```

The frontend will start at **`http://localhost:5173`** with an automated proxy forwarding `/api` calls directly to `http://127.0.0.1:8000`.

---

## 🔑 Adding API Keys & External Services

Wayfare runs **100% out of the box** without external keys using `AI_MODE=mock` and local development tokens. To connect live services:

### 1. Google Gemini API Key
To enable live AI generation:
1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. In `backend/.env` (or environment variables):
   ```env
   AI_MODE=gemini
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   GEMINI_MODEL=gemini-1.5-flash
   ```
3. Restart the backend.

### 2. Supabase (PostgreSQL + Auth + RLS)
To connect a live Supabase cloud database:
1. Create a new project in [Supabase](https://supabase.com/).
2. Open the **SQL Editor** in your Supabase dashboard and run the migration script located at:
   `supabase/migrations/20261031_initial_schema.sql`
   *(This creates `profiles`, `trips`, `trip_members`, `itinerary_days`, `itinerary_items`, and enables Row Level Security with owner/member access policies).*
3. In `backend/.env`:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_JWT_SECRET=your-jwt-secret
   ```
4. In `frontend/.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 🧪 Running the Backend Test Suite

To run the automated test suite verifying all 12 API features:

```bash
cd backend
python -m pytest tests/test_api.py -v
# OR run the standalone verification runner:
python tests/run_tests.py
```

Tests verify:
- Health check & CORS
- JWT authentication & demo persona login
- Multi-scenario trip listing (Solo, Couple, Group)
- Detailed itinerary and stop hierarchy
- Recharts cost summary & over-budget calculation
- 3 AI alternatives suggestion engine
- Item lock toggle & single day regeneration (locked item preservation)
- Public read-only share token link
- iCalendar (.ICS) file export
- Printable / PDF layout generation

---

## 🐳 Docker Deployment

To launch the full stack with Docker Compose:

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
