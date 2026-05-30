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

---

## 🚀 Improvement Proposals

### First-Principles Analysis
- **Trivia games live or die on question quality and fairness**: The core engagement loop requires that questions feel neither too easy (boring) nor impossibly obscure (frustrating) — adaptive difficulty per player is architecturally correct, but the GPT-4o question generation must produce questions with verifiable, unambiguous correct answers.
- **TMDB is metadata, not gameplay content**: TMDB provides titles, cast, poster images, and release data — it does not provide scene descriptions, dialogue, or plot details needed for "Scene Rewind" or "Quote Detective" modes; those modes require a separate content strategy (LLM generation with manual curation, or licensed subtitles/scripts).
- **Social comparison is the retention driver**: Daily Challenges and leaderboards work because players compare scores with others — without a social graph or at least a global leaderboard with friend filters, the competitive element feels hollow after the first session.
- **Copyright exposure is non-trivial**: Using character images, movie posters, and quotes from copyrighted films in a commercial game creates IP risk even when sourced through TMDB — TMDB's ToS permits API use for non-commercial purposes; monetisation changes this equation.

### Key Risks & Assumptions
- **GPT-4o will generate ambiguous or incorrect trivia questions**: LLM-generated questions about specific film details (cast, plot, quotes) can contain subtle errors — a wrong "correct answer" that the system marks right (or wrong) destroys user trust immediately; a human-review queue for generated questions is essential before they enter the production question bank.
- **TMDB rate limits and licensing scope**: TMDB's free tier has request rate limits and restricts commercial use — a viral game with thousands of concurrent users will hit API limits; caching TMDB responses is essential, and a commercial TMDB agreement should be pursued before any monetisation.
- **Difficulty adaptation requires a meaningful signal**: The README mentions "adapts difficulty per player" but without defining what signal drives adaptation (time-to-answer, accuracy by category, explicit self-report), the adaptive engine cannot be designed or tested — this is a core product decision, not an implementation detail.
- **"Scene Rewind" and "Quote Detective" modes require content not available from TMDB**: These modes need scene descriptions and accurate quotes — sourcing these from GPT-4o alone will produce hallucinated content, and sourcing from subtitles/scripts requires separate licensing.

### Concrete Improvement Ideas
- **Build a question review pipeline before any question enters production (highest impact)**: After GPT-4o generates questions, route them through a human review queue (initially manual, later semi-automated with confidence scoring) — flag questions with ambiguous answers and remove them; build this pipeline before generating any questions at scale.
- **Implement aggressive TMDB response caching**: Cache all TMDB API responses (movie details, cast, posters) with long TTLs (24-72 hours) in Postgres/Redis — this prevents rate-limit failures, reduces latency, and cuts API dependency for the game's read-heavy question serving path.
- **Define the adaptive difficulty signal explicitly in the ADR**: Decide whether difficulty adapts on response time, category accuracy, ELO score, or explicit player self-report — document this in `docs/adr/` before writing any adaptive logic, as the choice affects the entire scoring and question-generation architecture.
- **Start with a curated question bank for the top 50 titles**: Rather than generating all questions dynamically, manually curate and verify 10–20 questions per title for the 50 most-played movies/shows — this provides a reliable, copyright-reviewed foundation; use AI generation only for the long tail.
- **Add a "report a question" flow for players**: Let players flag questions they believe are wrong with a one-tap button — aggregate flags trigger removal from rotation and queue for re-review; this creates a quality flywheel that improves the question bank over time.
- **Design the social layer before building solo play features**: Define friend groups, challenge invitations, and shared leaderboard scopes early — these require schema changes that are expensive to retrofit; even if social features ship later, the data model must support them from the start.
