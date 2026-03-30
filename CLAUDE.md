# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Further Details

Full project documentation is in Notion under **TradeGuyz Software → Rank UoG**:
https://www.notion.so/331ef664edfe8098af30ee8c4f4bc3ee

## Project Overview

**RankUoG** is a GPA ranking and leaderboard platform for University of Guyana students. It displays student rankings by overall GPA, year group, department, and academic year.

Tech stack: React 19 + TypeScript + Vite + Tailwind CSS v4 (frontend), Node.js + Express (backend — not yet implemented), Supabase (PostgreSQL database).

## Commands

### Frontend (from `frontend/`)
```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Backend (from `backend/`)
```bash
npm run dev       # Start dev server (once implemented)
```

## Architecture

### Current State
The frontend is the only implemented layer. The backend (`backend/`) and admin (`administor/`) directories are stubs with no code. All data is currently hardcoded dummy data in the components.

### Frontend Structure (`frontend/src/`)
- **`App.tsx`** — Root component; renders `Navbar`, `States`, `UserTag`, `LeaderBoard` vertically
- **`components/Navbar.tsx`** — Top nav with mock auth state (`loggedIn` boolean toggle)
- **`components/States.tsx`** — Dashboard stats bar (participants, average GPA, top GPA, departments) — hardcoded
- **`components/LeaderBoard.tsx`** — Main feature component with tabs, filters, pagination, and sortable GPA rankings
- **`components/UserTag.tsx`** — Current user stats card shown when logged in — hardcoded to Kevin Johnson
- **`pages/`** — SignUp, SignOut, TermsOfService stubs (empty)

### Data Model
The `Student` interface in `LeaderBoard.tsx` defines the core data shape:
```typescript
interface Student {
  id: number;
  display_name: string;
  student_id: string;
  department: string;
  overall_gpa: number;
  enrolment_year: number;
  gpa_per_year: number[];  // index 0 = year 1
  is_current_user: boolean;
}
```

### Styling & Design System

Full design system: https://www.notion.so/332ef664edfe81f0848bf9b1389cf9b5

All components must follow these rules:

**Colours** (defined as CSS tokens in `index.css` `@theme` block):
- Page bg: `bg` (`#0a0a0a`)
- Cards/surfaces: `bg-white/5` or `bg-white/[0.03]` — never solid colours
- Borders/dividers: `border-white/10` — always opacity-based, never opaque
- Accent (gold): `#d4af37` | Accent hover: `#f5d97a`
- Muted text: `text-white/40` (labels), `text-white/50` (inactive), `text-white/60` (tertiary)
- Text on gold backgrounds: `#0a0a0a`

**Typography:**
- Body/UI: Nunito — `text-sm font-medium`
- IDs, GPA values, ranks: `font-mono`
- Leaderboard page heading only: Georgia serif — `text-3xl font-bold`
- Section labels: `text-[10px] font-semibold tracking-widest uppercase text-white/40`

**Layout:**
- Max content width: `max-w-[1000px] mx-auto px-6` — used on every section
- Border radius: `rounded-lg` (cards/containers), `rounded-md` (controls), `rounded-full` (badges, bars, circles)
- No shadows — depth via border + background opacity only

**Component patterns:**
- Cards: `bg-white/5 border border-white/10 rounded-lg px-4 py-3`
- Current-user / ownership highlight: `border-l-2 border-l-[#d4af37] bg-[#d4af37]/5`
- Active tabs: `border-b-2 border-[#d4af37] text-[#d4af37]`
- Toggle active state: `bg-[#d4af37] text-[#0a0a0a]`
- YOU badge: `bg-[#d4af37] text-[#0a0a0a] text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded-sm`
- GPA bar: track `bg-white/10 rounded-full h-1`, fill `bg-emerald-400`, width `(gpa/4.0)*100%`
- Rank circles — #1: gold `#d4af37`/dark text, #2: silver `#9ca3af`/dark text, #3: bronze `#b45309`/white text; rank 4+: `text-sm font-mono text-white/30`
- Department badges: `rounded-full px-2 py-0.5 text-[11px] font-medium` with per-department colour (CS: blue, Engineering: orange, Medicine: pink, Natural Sciences: green, Business: purple) using `bg-{color}-900/60 text-{color}-300 border border-{color}-700/40`
- Interactions: `transition-colors cursor-pointer`; hover rows `hover:bg-white/[0.02]`; hover text brightens toward `text-white`

### Database
Supabase project is configured via MCP (`.mcp.json`). Environment variables needed:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Key TODOs Embedded in Code
- `Navbar.tsx`: "Replace with real auth state when backend is ready"
- `LeaderBoard.tsx`: All 30 students are dummy data — replace with Supabase API calls
- `UserTag.tsx`: Hardcoded to Kevin Johnson — replace with authenticated user data
- `States.tsx`: Hardcoded stats — replace with aggregated Supabase queries
