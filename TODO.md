# netflix-character-game — Task Breakdown

## How to Use This File

Each phase is an **evidence gate**: you must have passing tests and a manual review before moving to the next phase.

**Workflow per task:**
1. Write the test FIRST (red — it must fail before you implement)
2. Implement until tests pass (green)
3. Review the diff yourself (`git diff`)
4. Commit with a descriptive message
5. If you discovered something not in CLAUDE.md or AGENTS.md, add it now

---

## Phase 0: Foundation ⬜

> Goal: working repo with CI, lint, type-check, and a passing smoke test.

- [ ] Init `package.json` with workspaces (`client`, `server`, `shared`)
- [ ] Install and configure TypeScript (strict mode) for all three workspaces
- [ ] Configure ESLint + Prettier (airbnb-ts ruleset)
- [ ] Set up Vitest for unit tests + first smoke test (`1 + 1 = 2`)
- [ ] Set up Supertest for server integration tests
- [ ] Configure GitHub Actions CI: `lint → type-check → test` on every push/PR
- [ ] Add `docker-compose.yml` with PostgreSQL 16 service
- [ ] Add `.env.example` with all required env var names (no secrets)
- [ ] Verify `npm run dev` starts both client (Vite) and server with `concurrently`

**Evidence gate:** CI passes on initial commit. `npm test` shows green.

---

## Phase 1: Data Layer ⬜

> Goal: database schema defined, migrations running, TMDB data syncing.

- [ ] Define Drizzle schema: `users`, `sessions`, `questions`, `answers`, `leaderboard`, `daily_challenges` (see `docs/spec.md` for full schema)
- [ ] Write migration for initial schema
- [ ] Write unit tests for schema validation (required fields, foreign keys)
- [ ] Build `TMDBService`: fetch trending movies + TV shows, fetch character/cast data by movie ID
- [ ] Write integration test: mock TMDB HTTP responses, assert service returns normalized `MediaItem[]`
- [ ] Build `ContentSeedJob`: nightly cron that fetches top-100 movies + top-50 TV shows from TMDB and upserts into `questions` seed table
- [ ] Write test: seed job deduplicates on TMDB ID (no duplicate rows)
- [ ] Add rate-limit guard on TMDB calls (max 40 req/10s per TMDB TOS)

**Evidence gate:** `npm run db:migrate` succeeds on clean DB. TMDB service tests pass with mocked responses.

---

## Phase 2: AI Question Engine ⬜

> Goal: GPT-4o generates valid, difficulty-scaled trivia questions from TMDB data.

- [ ] Write `QuestionGeneratorService` — takes a `MediaItem` + difficulty level, calls GPT-4o with structured output (JSON schema)
- [ ] Define `Question` schema: `id`, `type` (character/movie/quote/scene), `difficulty` (1–5), `prompt`, `correctAnswer`, `distractors[]`, `mediaId`, `hint`
- [ ] Write unit test: mock OpenAI SDK, assert generator returns valid `Question` object with 4 distractors
- [ ] Write test: generator handles OpenAI timeout gracefully (falls back to pre-seeded question bank)
- [ ] Add difficulty adaptation: `DifficultyService` adjusts player's next question difficulty based on last 5 answers (ELO-lite algorithm)
- [ ] Write test: player answering 5/5 correctly bumps difficulty by 1 level
- [ ] Write test: player answering 1/5 correctly drops difficulty by 1 level
- [ ] Prompt-engineer the GPT-4o system prompt; add it to `src/server/services/prompts/questionPrompt.ts`
- [ ] Test: generated questions for same media vary (no exact duplicate prompts within a session)

**Evidence gate:** 100% of question generator unit tests pass. Manual review: generate 10 questions for 3 different movies and assess quality.

---

## Phase 3: Game Engine & API ⬜

> Goal: full game loop (start → answer → score → next question → end) works via REST API.

- [ ] `POST /api/game/start` — creates a new game session, returns first question
- [ ] `POST /api/game/:sessionId/answer` — validates answer, returns result + score delta + next question (or game over)
- [ ] `GET /api/game/:sessionId/status` — returns current score, streak, difficulty level
- [ ] `POST /api/game/:sessionId/hint` — costs 1 hint token, returns hint for current question
- [ ] Write integration tests for all 4 endpoints (Supertest)
- [ ] Test: answering correctly increments score; answering incorrectly does not
- [ ] Test: streak of 3 correct answers triggers streak bonus
- [ ] Test: session expires after 30 minutes of inactivity
- [ ] Test: hint endpoint deducts hint token; if 0 tokens, returns 402
- [ ] Build `ScoreService`: calculates points (base × speed multiplier × difficulty multiplier)
- [ ] Write unit tests for all score calculation paths

**Evidence gate:** All integration tests pass. Manual playtesting of 3 full games from start to finish.

---

## Phase 4: Auth & User Profiles ⬜

> Goal: users can register, log in, and have persistent scores.

- [ ] `POST /api/auth/register` — hashes password (bcrypt, 12 rounds), issues JWT pair
- [ ] `POST /api/auth/login` — validates credentials, issues JWT pair
- [ ] `POST /api/auth/refresh` — validates refresh token, issues new access token
- [ ] `POST /api/auth/logout` — invalidates refresh token
- [ ] Write auth middleware: `requireAuth` that validates Bearer JWT
- [ ] Write integration tests for all auth endpoints (happy path + error cases)
- [ ] Test: expired access token returns 401; valid refresh token returns new access token
- [ ] Test: duplicate email registration returns 409
- [ ] Build `UserProfileService`: save game history, retrieve personal best, return stats
- [ ] Write test: `getPlayerStats` correctly aggregates scores across multiple sessions

**Evidence gate:** Auth integration tests pass. Manual test: register, log in, play a game, log out, log back in — scores persist.

---

## Phase 5: Leaderboard & Daily Challenge ⬜

> Goal: global leaderboard + daily challenge with shared scoring.

- [ ] `GET /api/leaderboard` — paginated global all-time top 100
- [ ] `GET /api/leaderboard/daily` — today's leaderboard (resets at midnight UTC)
- [ ] `GET /api/challenge/today` — returns today's daily challenge (same questions for all players)
- [ ] `POST /api/challenge/today/submit` — submits daily challenge score
- [ ] Write `DailyChallengeJob`: runs at 00:01 UTC, picks 10 questions from seeded bank + 2 AI-generated questions for the day
- [ ] Write test: all players calling `/api/challenge/today` within same UTC day get identical question set
- [ ] Write test: leaderboard is sorted by score DESC, then time-to-complete ASC on tie
- [ ] Write test: submitting daily challenge twice returns 409 (one submission per user per day)

**Evidence gate:** Leaderboard and daily challenge endpoints pass all tests. Manual test: two users complete daily challenge and both appear on leaderboard.

---

## Phase 6: React Frontend ⬜

> Goal: playable game UI that consumes all API endpoints.

- [ ] Set up React Router v6 routes: `/`, `/game`, `/leaderboard`, `/profile`, `/daily`
- [ ] Build `GameProvider` context: holds current session, score, streak, difficulty
- [ ] Build `QuestionCard` component: renders prompt, 4 answer buttons, timer bar
- [ ] Build `ScoreBoard` component: live score, streak counter, difficulty indicator
- [ ] Build `ResultModal` component: shows correct answer + explanation after each question
- [ ] Build `Leaderboard` page: paginated table with rank, username, score
- [ ] Build `DailyChallenge` page: countdown to next challenge + today's leaderboard
- [ ] Build `Profile` page: stats, game history, personal best
- [ ] Write component tests (Vitest + React Testing Library) for `QuestionCard` — all 4 answer options render, clicking triggers `onAnswer` callback
- [ ] Write test: `GameProvider` increments score on correct answer, leaves score unchanged on incorrect
- [ ] Implement animated timer bar (10s countdown per question, speed multiplier applied to score)
- [ ] Mobile-responsive layout (Tailwind, test at 375px and 768px breakpoints)

**Evidence gate:** All component tests pass. Manual playthrough on desktop + mobile. Lighthouse score ≥ 90 on Performance.

---

## Phase 7: Polish & Harden ⬜

> Goal: production-ready reliability and UX.

- [ ] Add request rate limiting (`express-rate-limit`): 60 req/min per IP on public routes, 200 req/min for authenticated
- [ ] Add Helmet.js for HTTP security headers
- [ ] Add input validation with Zod on all API request bodies
- [ ] Write test: Zod validation rejects malformed `POST /api/game/start` body with 400
- [ ] Add structured logging with `pino` (request/response, error traces, TMDB/OpenAI call durations)
- [ ] Add graceful shutdown handler (SIGTERM → drain connections → exit)
- [ ] Add E2E test with Playwright: full game loop from landing page to game-over screen
- [ ] Optimize DB queries: add indexes on `leaderboard.score`, `daily_challenges.date`, `sessions.userId`
- [ ] Write EXPLAIN ANALYZE for top 3 hot queries and document in ADR

**Evidence gate:** E2E test passes. Load test with k6: 100 concurrent users, p95 latency < 500ms on `/api/game/:id/answer`.

---

## Phase 8: Ship ⬜

> Goal: deployed and publicly accessible.

- [ ] Add `Dockerfile` for server (multi-stage, slim Node Alpine)
- [ ] Add `docker-compose.prod.yml` with server + db + nginx reverse proxy
- [ ] Add `npm run db:migrate:prod` guard (requires `NODE_ENV=production`)
- [ ] Write deployment runbook in `docs/deploy.md`
- [ ] Set up GitHub Actions `deploy.yml`: on push to `main` → build → push Docker image → trigger deploy
- [ ] Verify environment variables are set in deployment target (no hardcoded secrets)
- [ ] Smoke test production URL after first deploy

**Evidence gate:** App is live. Share URL + screenshot of working game as evidence.

---

## Parking Lot 🅿️

> Ideas to revisit — don't implement until a Phase is complete.

- Multiplayer real-time duels (WebSocket / Socket.io)
- Image-based questions (character portrait guessing using TMDB images)
- Category filters: horror only, comedy only, a specific franchise
- Spotify integration: guess the movie from its soundtrack snippet
- Social sharing: share score card as image (OG image generation)
- Admin dashboard: review and approve AI-generated questions before they enter the pool

---

## Lessons Learned 📝

> Add entries here as you discover conventions, gotchas, or decisions.

| Date | Learning |
|------|----------|
| —    | (first entry goes here) |
