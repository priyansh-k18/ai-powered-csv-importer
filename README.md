# GrowEasy AI-powered CSV Importer

This project is a full-stack application that intelligently extracts CRM lead information from any CSV format using AI. It allows users to upload CSVs with varying column names and structures, and uses an LLM (Google Gemini) to map them to the standard GrowEasy CRM fields.

## Features
- **Intelligent Field Mapping**: Extracts fields like Name, Email, Mobile, Company, CRM Status, Source, and Creation Date regardless of CSV column headers.
- **Drag & Drop Upload**: Modern UI for uploading files.
- **Preview Table**: Responsive table to preview the uploaded data before importing.
- **Dark Mode Support**: Beautiful dark mode and light mode based on system preference.
- **Results Table**: Displays the successfully parsed and formatted records.

## Tech Stack
- **Frontend**: Next.js, Tailwind CSS, Lucide React, PapaParse
- **Backend**: Node.js, Express, Multer, PapaParse, Google Gemini API SDK

## Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` directory.
   \`\`\`bash
   cd backend
   \`\`\`
2. Install the dependencies.
   \`\`\`bash
   npm install
   \`\`\`
3. Set up environment variables. Create a `.env` file in the `backend` directory by copying the example:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
4. Open the `.env` file and replace `your_api_key_here` with your actual Google Gemini API Key.
5. Start the backend development server:
   \`\`\`bash
   npm run start # or node index.js
   \`\`\`
   The backend will run on `http://localhost:5000`.

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory.
   \`\`\`bash
   cd frontend
   \`\`\`
2. Install the dependencies.
   \`\`\`bash
   npm install
   \`\`\`
3. (Optional) Set the backend API URL. If your backend is running on a port other than 5000, create a `.env.local` file in the `frontend` directory:
   \`\`\`env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/upload
   \`\`\`
4. Start the frontend development server:
   \`\`\`bash
   npm run dev
   \`\`\`
5. Open your browser and navigate to `http://localhost:3000`.

## Submission Info
- **Position applied for**: Software Developer (Full-Time)
- **Hosted App**: (Add Vercel / Render URL here)
- **GitHub Repo**: (Add GitHub Repo URL here)
