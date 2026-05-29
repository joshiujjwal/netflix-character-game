# AGENTS.md — netflix-character-game

OpenAI Codex / AI agent configuration. Read this before making any changes.

---

## Setup

```bash
# Install dependencies (Node 20+, npm 10+)
npm install

# Start the database (requires Docker)
npm run dev:db

# Run migrations
npm run db:migrate

# Start dev servers
npm run dev
```

### First-time checks
```bash
npm test          # must pass before any changes
npm run typecheck # must pass before any changes
npm run lint      # fix warnings before committing
```

---

## Repository Structure

```
src/client/   React 18 + TypeScript frontend (Vite)
src/server/   Express + TypeScript backend API
src/shared/   Types and constants shared by both
tests/        Test suite — unit/, integration/, e2e/
docs/         spec.md (data model + API) + adr/ (architecture decisions)
```

---

## Code Style Rules

### General
- TypeScript strict mode — zero `any`, zero `@ts-ignore` without justification comment
- Named exports everywhere — no default exports (makes refactoring and grep easier)
- No barrel files (`index.ts` re-exports) unless they add clarity
- Use `const` over `let`; never `var`
- Early returns to reduce nesting — max 3 levels of nesting in any function

### Naming
- Files: `kebab-case.ts` (e.g., `score.service.ts`, `question-card.tsx`)
- Types/Interfaces: `PascalCase` (e.g., `GameSession`, `QuestionType`)
- Enums: `PascalCase` with `PascalCase` members (e.g., `GameStatus.Active`)
- Functions/variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE` for module-level constants
- React components: `PascalCase`

### TypeScript
```typescript
// ✅ Good — explicit types on function boundaries
function calculateScore(params: ScoreParams): ScoreResult { ... }

// ❌ Bad — inferred any
function processAnswer(answer) { ... }

// ✅ Good — Zod for runtime validation + type inference
const schema = z.object({ sessionId: z.string().uuid() });
type Params = z.infer<typeof schema>;

// ✅ Good — explicit error handling in services
const result = await tmdbService.getMedia(id);
if (!result.ok) return fallbackQuestion();
```

### React
- Functional components only — no class components
- `useCallback` / `useMemo` only when profiler shows it matters — no premature memoization
- Data fetching via custom hooks (`useGame`, `useLeaderboard`) — no fetch calls in components
- Tailwind for all styling — no inline styles, no CSS modules

### Express / API
- Controller functions are thin: validate → call service → return response
- All business logic in `src/server/services/`
- Always `await` async operations — no floating promises
- Use `asyncHandler` wrapper on all async route handlers to catch rejections

---

## Testing Instructions

### Red/Green TDD (required)
1. Write a failing test that describes the behavior you want
2. Run `npm test` — confirm it fails for the right reason
3. Implement the minimum code to make it pass
4. Run `npm test` — confirm it passes and no other tests broke
5. Refactor if needed, re-run tests

### Running Tests
```bash
npm test                        # all tests
npm run test:watch              # TDD watch mode
npx vitest tests/unit/          # unit tests only
npx vitest tests/integration/   # integration tests only
npm run test:e2e                # Playwright (needs running server)
```

### Test Conventions
- **Unit tests**: pure functions, no I/O. Mock all external dependencies with `vi.mock`.
- **Integration tests**: real Drizzle + SQLite in-memory DB. Mock HTTP (TMDB, OpenAI) with `msw`.
- **E2E tests**: Playwright against running server. Needs `.env.test` with test credentials.
- Fixtures: `tests/fixtures/tmdb/` and `tests/fixtures/openai/` for mock API responses
- Every new service function needs at least: happy path test + one error/edge case test

### What Must Never Break
- `npm test` must pass on `main` at all times
- `npm run typecheck` must pass on `main` at all times
- Auth flows (register, login, refresh, logout)
- Score calculation (deterministic — same inputs → same score always)

---

## PR Instructions

- **Evidence required**: every PR description must include test output (`npm test` summary) and manual verification steps
- **One concern per PR**: do not mix features with refactoring or bug fixes
- **Tests before merge**: CI must be green (lint + typecheck + test)
- **Review AI descriptions**: if Copilot wrote the PR description, re-read the diff and verify the description is accurate before merging
- **Do not remove tests**: if a test is blocking you, fix the code, not the test (unless the test is wrong — document why)
- **Migration files**: always include Drizzle migration files when the schema changes

---

## External API Reference

### TMDB
- Base URL: `https://api.themoviedb.org/3`
- Auth: `Authorization: Bearer <TMDB_ACCESS_TOKEN>` header
- Key endpoints used:
  - `GET /trending/all/week` — weekly trending content
  - `GET /movie/{id}/credits` — cast list for a movie
  - `GET /tv/{id}/credits` — cast list for a TV show
  - `GET /search/multi?query=` — cross-type search
- Rate limit: 40 req / 10s — enforced in `TMDBService`

### OpenAI
- Model: `gpt-4o`
- Use `response_format: { type: "json_schema", json_schema: { ... } }` for structured output
- Temperature: 0.8 for creative questions, 0.2 for answer validation
- Max tokens: 512 per question generation call
- Client: `src/server/services/openai.service.ts` — do not instantiate `OpenAI` client outside this file
