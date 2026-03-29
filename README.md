# Rankuog

A ranking and leaderboard platform.

## Project Structure

```
rankuog/
├── frontend/       # React client application
├── backend/        # Node.js / Express REST API
└── administor/     # Platform administration notes and resources
```

## Tech Stack

### Frontend
- **Framework:** React
- **Communication:** REST API

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **API:** REST

### Database
- **Supabase** (PostgreSQL)

### Notable Tools
- **React Toastify** — toast notifications on the frontend
- **Resend** — transactional email delivery
- **n8n** — workflow automation and integrations

### Administration
- **Notion** — used to manage platform operations, content, and workflows

## Getting Started

### Prerequisites
- Node.js
- Supabase account (or local Supabase CLI)

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Database

Configure your Supabase project credentials in your backend environment variables.

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Contributing

1. Create a feature branch from `master`
2. Make your changes
3. Open a pull request
