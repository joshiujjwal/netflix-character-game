# 🎬 netflix-character-game

> Interactive trivia & guessing game featuring characters from popular movies and TV shows.

![Status](https://img.shields.io/badge/status-🚧%20Early%20Development-orange)
![Stack](https://img.shields.io/badge/stack-TypeScript%20%7C%20React%20%7C%20Node.js%20%7C%20PostgreSQL-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Players guess characters, movies, quotes, and scenes. AI dynamically generates questions, tracks scores, and adapts difficulty per player. Content sourced from the TMDB API; question generation powered by OpenAI GPT-4o.

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18 + TypeScript + Vite        |
| Backend     | Node.js + Express + TypeScript      |
| Database    | PostgreSQL 16 + Drizzle ORM         |
| AI          | OpenAI GPT-4o (question generation) |
| Content API | TMDB (The Movie Database API)       |
| Auth        | JWT (access + refresh tokens)       |
| Styling     | Tailwind CSS                        |
| Testing     | Vitest (unit) + Supertest (API)     |
| CI          | GitHub Actions                      |

---

## Getting Started

```bash
# 1. Clone
git clone https://github.com/joshiujjwal/netflix-character-game.git
cd netflix-character-game

# 2. Install dependencies
npm install

# 3. Copy env template and fill in secrets
cp .env.example .env

# 4. Start the database
docker compose up -d db

# 5. Run database migrations
npm run db:migrate

# 6. Start dev servers (client + server)
npm run dev
```

### Required Environment Variables

```
DATABASE_URL=postgresql://user:pass@localhost:5432/netflixgame
OPENAI_API_KEY=sk-...
TMDB_API_KEY=...
TMDB_ACCESS_TOKEN=...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
```

---

## Project Structure

```
netflix-character-game/
├── src/
│   ├── client/               # React frontend (Vite)
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Route-level page components
│   │   ├── context/          # React context providers
│   │   └── utils/            # Client-side helpers
│   ├── server/               # Express backend
│   │   ├── routes/           # Express routers
│   │   ├── controllers/      # Route handlers
│   │   ├── services/         # Business logic (TMDB, OpenAI, game)
│   │   ├── db/               # Drizzle schema + migrations
│   │   └── middleware/       # Auth, error handling, rate limiting
│   └── shared/               # Types and constants shared by both
│       ├── types/            # Shared TypeScript interfaces
│       └── constants/        # Game config, difficulty thresholds
├── tests/
│   ├── unit/                 # Vitest unit tests (mirrors src/)
│   ├── integration/          # API integration tests (Supertest)
│   └── e2e/                  # End-to-end tests (Playwright)
├── docs/
│   ├── spec.md               # Feature specification
│   └── adr/                  # Architecture decision records
├── .github/
│   ├── copilot-instructions.md
│   ├── instructions/         # Path-specific Copilot instructions
│   └── skills/               # Agent skills
├── README.md
├── TODO.md
├── CLAUDE.md
├── AGENTS.md
└── .gitignore
```

---

## Game Modes

| Mode              | Description                                         |
|-------------------|-----------------------------------------------------|
| Character Guess   | "Who is this character?" — image or description     |
| Movie Match       | "Which movie is this character from?"               |
| Quote Detective   | "Who said this quote?"                              |
| Scene Rewind      | Describe a scene, guess the title/character         |
| Daily Challenge   | One curated challenge per day, global leaderboard   |

---

## Contributing

1. **Always write tests first** (red phase) before implementing
2. Run `npm test` before every commit — do not commit with failing tests
3. PRs must include **evidence**: test output, screenshots, or manual test steps
4. Keep PRs small and focused — one feature or fix per PR
5. Update `CLAUDE.md` / `AGENTS.md` if you discover a new convention
6. AI-assisted PRs: review the diff yourself before pushing; annotate what you verified

---

## Architecture Decisions

See [`docs/adr/`](docs/adr/) for architecture decision records.
