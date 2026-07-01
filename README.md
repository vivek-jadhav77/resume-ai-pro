# ResumeAI Pro

ResumeAI Pro is a production-ready, full-stack web application (MERN Stack) that analyzes resumes, calculates ATS compatibility scores, and uses the OpenAI API to provide optimization suggestions and generate interview questions based on job descriptions.

## Features
- **User Authentication:** JWT based auth with Candidate and Admin roles.
- **Resume Upload & Parsing:** Support for PDF and DOCX files. Extracts text using `pdf-parse` and `mammoth`. Uploads files to Cloudinary.
- **AI-Powered ATS Engine:** Integrates with OpenAI API to calculate ATS scores, formatting scores, and keyword densities.
- **Job Description Matcher:** Compare uploaded resumes against job descriptions to identify missing keywords.
- **Interview Prep:** Generate technical and behavioral interview questions tailored to the candidate's parsed resume and the job description.
- **Modern Dashboard:** Built with React, Vite, Tailwind CSS, and Framer Motion for a SaaS-like experience.

## Tech Stack
- **Frontend:** React.js, Vite, React Router, Axios, Tailwind CSS, Framer Motion, Recharts
- **Backend:** Node.js, Express.js, MongoDB Atlas (Mongoose), JSON Web Tokens (JWT)
- **File Storage:** Cloudinary, Multer
- **AI Services:** OpenAI API (GPT-4 Turbo)

## Quick Start

### 1. Clone & Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Environment Variables
You must create a `.env` file in the `backend` directory. Use the provided `.env.example` as a reference.

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
OPENAI_API_KEY=your_openai_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Run Locally

**Start Backend (runs on port 5000):**
```bash
cd backend
npm run dev
```

**Start Frontend (runs on port 5173, proxies to 5000):**
```bash
cd frontend
npm run dev
```

## Architecture
- **Controllers:** Handle request/response logic.
- **Services:** External API integrations (OpenAI, Cloudinary).
- **Utils:** Reusable functions (Resume parsers).
- **Middlewares:** JWT protection, Admin role checking, File upload limits.
- **Models:** Mongoose Schemas (User, Resume, JobDescription, Report).

## Deployment
- **Frontend:** Deployable to Vercel/Netlify. Run `npm run build`.
- **Backend:** Deployable to Render/Railway. Set all Environment Variables in the provider's dashboard.
