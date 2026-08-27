# Career Skill Analyzer

Career Skill Analyzer is a full-stack web application that helps users compare their resume against a target job description and eventually generates a personalized learning roadmap.

## Current Module
Module 05 adds Google-only authentication using Firebase Authentication and Firebase Admin. Firebase handles identity while MongoDB stores users and user-owned analysis records. Uploaded PDF/DOCX binaries are still processed in memory only.

## Technologies
- React, Vite, Tailwind CSS
- Node.js, Express.js
- Axios, React Router
- Multer, pdf-parse, Mammoth, Zod
- Mongoose
- Firebase Authentication, Firebase Admin

## Run locally
Install dependencies in both packages, then run each in its own terminal:

```bash
cd client
npm install
npm run dev
```

```bash
cd server
npm install
npm run dev
```

Copy `client/.env.example` to `client/.env` and `server/.env.example` to `server/.env`. Set `MONGODB_URI` to a local MongoDB or Atlas connection string before starting the backend.

## API endpoints
- `GET /api/health` checks server availability.
- `POST /api/resume/extract` accepts a multipart `resume` field and extracts PDF/DOCX text.
- `POST /api/analyze` validates the prepared input and calculates `totalAvailableHours`.
- `GET /api/analysis/:id` retrieves a persisted analysis by ID.
- `GET /api/analyses` lists only the authenticated user's analyses.

Supported resume formats are PDF and DOCX, with a maximum file size of 5 MB. Job descriptions must be 50–10,000 characters, target roles 2–100 characters, available days 1–30, and hours per day 1–8. Total available hours always equals `availableDays * hoursPerDay`; a client-provided total is ignored. The results overview, skill gap, learning plan, and roadmap remain future-module placeholders.

## Firebase setup
1. Create a Firebase project and enable Authentication > Google.
2. Register a Firebase Web App and copy its configuration into `client/.env` using `client/.env.example`.
3. Create a Firebase service account and configure `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` in `server/.env`.
4. Add `localhost` to Firebase Authentication authorized domains.
5. Start MongoDB, then start the backend and frontend.

No email/password, custom JWT, or other sign-in providers are implemented.

## MongoDB setup
1. Start MongoDB locally or create an Atlas cluster.
2. Set `MONGODB_URI` in `server/.env` (the example uses `mongodb://127.0.0.1:27017/career-skill-analyzer`).
3. Start the backend. It connects to MongoDB before accepting requests.
4. Submit an analysis, then refresh `/results/<analysisId>` to verify persistence.
