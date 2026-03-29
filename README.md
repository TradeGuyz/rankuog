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
- **PostgreSQL**

### Administration
- **Notion** — used to manage platform operations, content, and workflows

## Getting Started

### Prerequisites
- Node.js
- PostgreSQL

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

Create a PostgreSQL database and configure the connection string in your backend environment variables.

```env
DATABASE_URL=postgresql://user:password@localhost:5432/rankuog
```

## Contributing

1. Create a feature branch from `master`
2. Make your changes
3. Open a pull request
