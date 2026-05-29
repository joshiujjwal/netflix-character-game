# CLAUDE.md — netflix-character-game

Context for AI agents picking up this codebase. Keep this file under 200 lines.
Update it whenever you discover a non-obvious convention or gotcha.

---

## Essential Commands

```bash
# Install all workspace dependencies
npm install

# Dev (starts Vite on :5173 + Express on :3001 concurrently)
npm run dev

# Build (client + server)
npm run build

# Tests — ALWAYS run before committing
npm test                    # all unit + integration tests
npm run test:watch          # watch mode for TDD
npm run test:e2e            # Playwright E2E (requires running server)

# Lint + type-check
npm run lint                # ESLint
npm run typecheck           # tsc --noEmit (all workspaces)

# Database
npm run db:migrate          # run pending Drizzle migrations
npm run db:migrate:generate # generate new migration from schema changes
npm run db:seed             # seed local DB with TMDB sample data
npm run db:studio           # open Drizzle Studio (DB browser)

# Utilities
npm run dev:db              # docker compose up -d db (start Postgres only)
npm run tmdb:sync           # manually trigger TMDB content sync
```

---

## Directory Map

```
src/client/          React app (Vite). Entry: src/client/main.tsx
src/server/          Express app. Entry: src/server/index.ts
src/shared/          Types + constants imported by both client and server
src/server/db/       Drizzle schema (schema.ts) + migrations folder
src/server/services/ Business logic — one file per domain:
                       tmdb.service.ts     — TMDB API calls
                       openai.service.ts   — GPT-4o question generation
                       game.service.ts     — game session state machine
                       score.service.ts    — scoring algorithm
                       difficulty.service.ts — ELO-lite adaptation
                       daily.service.ts    — daily challenge generation
tests/unit/          Mirror of src/ — e.g., tests/unit/server/services/score.service.test.ts
tests/integration/   Supertest API tests — e.g., tests/integration/game.api.test.ts
tests/e2e/           Playwright tests
docs/spec.md         SOURCE OF TRUTH for data model and API design
docs/adr/            Architecture Decision Records (one per major decision)
```

---

## Workflow (Follow This Order)

1. **Read TODO.md** — identify the current phase and the next unchecked task
2. **Run `npm test`** — confirm existing tests pass before touching anything
3. **Write the failing test first** (Vitest for unit/integration, Playwright for E2E)
4. **Implement** until `npm test` passes
5. **Run `npm run lint && npm run typecheck`** — fix any errors before committing
6. **Review the diff** (`git diff --staged`) — do not commit AI-generated code you haven't read
7. **Commit** with message format: `type(scope): description` (e.g., `feat(game): add hint deduction logic`)
8. **Update TODO.md** — check off the completed task
9. **Update this file** if you learned something non-obvious

---

## Key Conventions

### TypeScript
- `strict: true` everywhere — no `any`, no `!` non-null assertions without a comment explaining why
- Shared types live in `src/shared/types/` — import from `@shared/types` path alias
- All API request/response bodies must have a Zod schema in `src/server/schemas/`
- Drizzle ORM for all DB access — no raw SQL except in explicitly labelled performance-critical queries

### API
- All routes return `{ data, error, meta }` envelope
- HTTP status codes: 200 success, 201 created, 400 validation, 401 unauth, 403 forbidden, 404 not found, 409 conflict, 410 gone (expired session), 429 rate limited, 500 server error
- Never expose stack traces in error responses in production

### Services
- Services are pure functions or classes with no Express `req/res` dependencies
- OpenAI and TMDB calls always have a try/catch — service must never throw to the route handler
- Fallback: if `QuestionGeneratorService` fails, fall back to `QuestionBankService.getRandom()`

### Testing
- Test file name: `<original-file>.test.ts` co-located or mirrored in `tests/`
- Mock external HTTP with `msw` (Mock Service Worker) — do not make real TMDB/OpenAI calls in tests
- Mock OpenAI SDK with `vi.mock('openai')` — return fixture from `tests/fixtures/openai/`
- Integration tests use a real in-memory SQLite DB via Drizzle's test adapter

### Environment
- Never import from `.env` directly — always use `src/server/config.ts` which validates env with Zod at startup
- If a required env var is missing, the server must fail fast with a clear error, not silently

---

## Gotchas

- **TMDB rate limit**: 40 requests / 10 seconds. `TMDBService` has a built-in queue — do not bypass it.
- **GPT-4o structured output**: always use `response_format: { type: "json_schema" }` — plain `json_object` does not enforce schema and breaks the parser.
- **Drizzle migrations**: run `npm run db:migrate:generate` after ANY schema change, even adding an index. Committing schema changes without a migration will break other devs.
- **Session expiry**: `game_sessions.expires_at` is checked on every answer endpoint. A session that is expired returns 410, not 404.
- **Daily challenge determinism**: the daily challenge question set is generated once (by `DailyChallengeJob`) and stored. Never re-generate it on each request or different players get different questions.
- **TMDB images**: `poster_path` from TMDB is a relative path. Prepend `https://image.tmdb.org/t/p/w500` to get the full URL.
