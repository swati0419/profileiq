# ProfileIQ

ProfileIQ is an AI-powered resume evaluation and optimization platform that helps job seekers improve their resumes for Applicant Tracking Systems (ATS). It leverages Groq API to analyze resumes, compare them with job descriptions, detect missing keywords and skills, calculate ATS scores, and generate personalized recommendations. Built with the MERN stack, ProfileIQ offers secure authentication, resume history tracking, and an interactive dashboard for managing analyses.

**Live demo:** https://profileiq-flax.vercel.app
**Backend API:** https://profileiq-j21e.onrender.com

---

## Features

- 🔐 **Authentication** — secure signup/login with JWT and bcrypt password hashing
- 📄 **Resume upload** — supports PDF upload or direct text paste
- 🎯 **ATS scoring** — overall ATS compatibility score, keyword match %, and format score
- 🔍 **Keyword analysis** — found, missing, and partially-matched keywords from the job description
- 📊 **Skill-gap detection** — visual comparison of your skill level vs. the role's required level
- 📈 **Section breakdown** — radar chart across experience, skills, education, projects, and impact
- 💡 **Improvement suggestions** — actionable, AI-generated resume feedback
- 🕓 **History** — every assessment is saved and tied to your account
- 📊 **Dashboard** — aggregate stats and score trends across all your assessments
- 🌙 **Dark mode**
- 🔒 **Per-user data isolation** — each user only sees their own assessments

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router, Recharts, Axios |
| Backend | Node.js, Express |
| Database | MongoDB (MongoDB Atlas) with Mongoose |
| Authentication | JWT |
| AI | Groq API (Llama 3.3 70B) |
| PDF parsing | pdf2json |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

---

## Project structure

```
profileiq/
├── server/
│   ├── index.js              # Express entry point
│   ├── middleware/
│   │   └── auth.js           # JWT auth middleware
│   ├── models/
│   │   ├── Assessment.js     # Assessment schema
│   │   └── User.js           # User schema
│   └── routes/
│       ├── auth.js           # Register / login / get current user
│       ├── resume.js         # Resume analysis (AI call)
│       └── assessments.js    # History, stats, CRUD
└── client/
    ├── vercel.json           # SPA routing config
    ├── vite.config.js
    └── src/
        ├── context/
        │   └── AuthContext.jsx
        ├── utils/
        │   └── api.js         # Axios instance with auth interceptor
        ├── components/
        │   └── Layout.jsx     # Nav bar, dark mode toggle
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Analyze.jsx     # Upload + submit form
            ├── Results.jsx     # Full assessment view
            ├── History.jsx     # Past assessments
            └── Dashboard.jsx   # Aggregate analytics
```

---

## How it works

1. User registers/logs in — backend issues a JWT
2. User uploads a resume (PDF or text) and pastes a job description
3. Backend extracts text from the PDF (if uploaded) using `pdf2json`
4. The resume + job description are sent to Groq's Llama 3.3 70B model with a structured prompt
5. The AI returns a JSON object: ATS score, keyword match, section scores, skill gaps, and suggestions
6. The result is saved to MongoDB, tagged with the user's ID
7. User is redirected to the results page to view their full breakdown
8. History and Dashboard pages query MongoDB, filtered to the logged-in user only

---

## Running locally

### Prerequisites
- Node.js v18+
- MongoDB (local install or a free MongoDB Atlas cluster)
- A free Groq API key — https://console.groq.com

### 1. Clone and install
```bash
git clone https://github.com/swati0419/profileiq.git
cd profileiq

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables
Create `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/profileiq
GROQ_API_KEY=your_groq_api_key_here
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_random_secret_string
```

### 3. Run
In one terminal:
```bash
cd server
npm run dev
```
In another terminal:
```bash
cd client
npm run dev
```

Visit **http://localhost:5173**

---






