# 🚀 AI Job Application Agent SaaS

An AI-powered job application platform that helps job seekers automate and organize their job search. Upload your resume, discover matching opportunities, track applications, save jobs, and let an AI-powered browser agent apply to jobs faster.

Built with **Next.js**, **React**, **Supabase**, **Browserbase**, **Antigravity AI**, **CodeRabbit**, and modern AI workflows.

---

# ✨ Features

## 🤖 AI Resume Analysis
- Upload PDF or DOCX resumes
- AI extracts skills, experience, education, and keywords
- Resume scoring and optimization suggestions
- Generate structured candidate profile

## 🔍 AI Job Matching
- Match jobs based on resume
- Semantic search using embeddings
- AI ranking of job relevance
- Skill gap analysis
- Personalized recommendations

## 💼 Job Discovery
- Search thousands of job listings
- Filter by
  - Location
  - Remote
  - Salary
  - Experience
  - Company
  - Job Type
- Save favorite jobs

## 🤖 AI Job Application Agent
- Automatically open job pages
- Fill application forms
- Upload resume
- Answer common application questions
- Track application status
- Human approval before submission (optional)

Powered by **Browserbase** browser automation.

## 📊 Application Tracker
Track every application.

Statuses include:

- Saved
- Applied
- Interview
- Assessment
- Offer
- Rejected

Timeline view included.

## 📄 Resume Manager
- Multiple resumes
- Resume versioning
- Resume previews
- Download optimized versions

## 📝 Cover Letter Generator
Generate personalized cover letters using AI.

Customize by:
- Company
- Role
- Skills
- Tone

## 📈 Dashboard
Overview includes:

- Applications sent
- Saved jobs
- Interviews
- Response rate
- Weekly activity
- AI recommendations

## 🔐 Authentication
- Email Login
- Google OAuth
- Secure sessions via Supabase Auth

---

# 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | Frontend + Backend |
| React 19 | UI |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| Shadcn UI | Components |
| Supabase | Database + Auth + Storage |
| Browserbase | Browser Automation |
| Antigravity AI | AI Agents |
| OpenAI | Resume & Job Intelligence |
| CodeRabbit | AI Code Reviews |
| Vercel | Deployment |

---

# 🏗 Architecture

```
                User

                 │

         Next.js Frontend

                 │

        API Routes / Server Actions

        ┌──────────┬───────────┐
        │          │           │
        ▼          ▼           ▼

   Supabase    OpenAI    Browserbase
 Database        AI        Browser

                 │
                 ▼

          Antigravity Agent
```

---

# 📂 Project Structure

```
ai-job-agent/

│

├── app/
│   ├── dashboard/
│   ├── jobs/
│   ├── applications/
│   ├── profile/
│   ├── api/
│   └── auth/
│
├── components/
│
├── lib/
│   ├── supabase.ts
│   ├── browserbase.ts
│   ├── antigravity.ts
│   └── ai.ts
│
├── hooks/
│
├── services/
│
├── types/
│
├── utils/
│
├── public/
│
└── prisma/
```

---

# ⚙️ Installation

Clone the repository.

```bash
git clone https://github.com/jyotidxt/AI_jobApplication-agent.git

cd ai-job-agent
```

Install dependencies.

```bash
npm install
```

Create environment variables.

```bash
cp .env.example .env.local
```

Run development server.

```bash
npm run dev
```

---

# 🔑 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

OPENAI_API_KEY=

BROWSERBASE_API_KEY=

BROWSERBASE_PROJECT_ID=

ANTIGRAVITY_API_KEY=

NEXTAUTH_SECRET=

NEXTAUTH_URL=
```

---

# 🗄 Database Schema

## Users

```sql
id
email
name
created_at
```

## Resumes

```sql
id
user_id
file_url
parsed_data
created_at
```

## Jobs

```sql
id
title
company
location
salary
url
description
```

## Saved Jobs

```sql
id
user_id
job_id
```

## Applications

```sql
id
user_id
job_id
status
notes
applied_at
```

---

# 🤖 AI Workflow

### Step 1

User uploads resume.

↓

### Step 2

AI extracts:

- Skills
- Experience
- Education
- Certifications

↓

### Step 3

Job search begins.

↓

### Step 4

AI ranks jobs by match score.

↓

### Step 5

User saves or applies.

↓

### Step 6

Browserbase agent opens application.

↓

### Step 7

AI fills forms.

↓

### Step 8

Resume uploaded.

↓

### Step 9

Application submitted.

↓

### Step 10

Status tracked automatically.

---

# 📸 Screenshots

## Dashboard

- Resume score
- Job matches
- Applications
- Analytics

---

## Job Search

- AI Match %
- Save Job
- Apply Now

---

## Application Tracker

- Kanban View
- Timeline
- Notes
- Interview Tracker

---

## AI Resume Analyzer

- Skill Extraction
- ATS Score
- Suggestions

---

# 🚀 Deployment

Deploy easily on **Vercel**.

```bash
npm run build
```

```bash
vercel
```

---

# 🔒 Security

- Row Level Security (Supabase)
- JWT Authentication
- Secure API Routes
- Rate Limiting
- File Validation
- Encrypted Secrets

---

# 🧪 Future Improvements

- LinkedIn integration
- Indeed integration
- Glassdoor integration
- AI interview preparation
- Salary prediction
- Recruiter CRM
- Email automation
- Calendar scheduling
- Chrome Extension
- Mobile application
- Multi-language support
- Team accounts

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

# 📄 License

Licensed under the MIT License.

---

# 🙌 Acknowledgements

- Next.js
- React
- Supabase
- Browserbase
- Antigravity AI
- OpenAI
- CodeRabbit
- Tailwind CSS
- Shadcn UI

---

## ⭐ If you found this project helpful, consider giving it a star on GitHub!