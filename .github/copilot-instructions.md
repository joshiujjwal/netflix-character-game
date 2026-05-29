# GitHub Copilot Instructions — netflix-character-game

## Project Summary
Interactive trivia/guessing game featuring characters from movies and TV shows.
AI (GPT-4o) generates questions dynamically. Content sourced from TMDB API.
Stack: TypeScript + React 18 + Vite + Node.js + Express + PostgreSQL + Drizzle ORM.

---

## Stack Quick Reference

| Concern         | Tool/Library                              |
|-----------------|-------------------------------------------|
| Frontend        | React 18, Vite, TypeScript, Tailwind CSS  |
| Backend         | Node.js, Express, TypeScript              |
| Database ORM    | Drizzle ORM (PostgreSQL dialect)          |
| Validation      | Zod (all API bodies + env config)         |
| AI              | OpenAI SDK v4+ (`gpt-4o`, structured output) |
| Content         | TMDB API (Bearer token auth)              |
| Auth            | JWT (access 15m, refresh 7d, bcrypt pw)   |
| Testing         | Vitest, React Testing Library, Supertest, Playwright |
| HTTP mocking    | msw (Mock Service Worker)                 |
| Logging         | pino                                      |
| Containerization| Docker + docker-compose                   |

---

## Coding Conventions

### TypeScript
- `strict: true` always — never suggest `any` or `@ts-ignore`
- Prefer `type` over `interface` unless you need declaration merging
- Use Zod for all runtime validation; derive TypeScript types with `z.infer<typeof schema>`
- All public service functions must have explicit return type annotations

### React
- Functional components only
- Custom hooks for all server state (`useGame`, `useLeaderboard`, `useAuth`)
- Tailwind utility classes — no inline styles
- No default exports — use named exports for all components

### Express
- Route handlers: validate input → call service → send response (no logic in route handlers)
- Wrap async handlers: `router.post('/path', asyncHandler(async (req, res) => { ... }))`
- All errors go through the central error handler middleware (`src/server/middleware/errorHandler.ts`)

### Database (Drizzle)
- Schema defined in `src/server/db/schema.ts`
- Always use parameterized queries — never string-interpolate user input into SQL
- Generate migrations with `npm run db:migrate:generate` after schema changes — never edit migration files manually

---

## Testing Conventions

- **Always write the test first** (TDD — red before green)
- Unit tests: `vi.mock()` for all external dependencies; no network calls
- Integration tests: in-memory SQLite via Drizzle test adapter; mock HTTP with `msw`
- Test naming: `describe('ServiceName.methodName')` → `it('should <expected behavior> when <condition>')`
- Fixture files for TMDB and OpenAI mock responses: `tests/fixtures/`
- Never delete or skip tests to make CI pass — fix the underlying code

---

## Boundaries (Do Not Cross Without Being Asked)

- Do **not** refactor working code unless the user specifically asks for refactoring
- Do **not** change Drizzle schema without also generating a migration file
- Do **not** add new npm dependencies without stating why the existing stack is insufficient
- Do **not** make real API calls to TMDB or OpenAI in tests — use `msw` fixtures
- Do **not** log sensitive data (passwords, tokens, full request bodies with auth headers)
- Do **not** remove tests — if a test is wrong, fix it with an explanation
- Do **not** change the scoring algorithm in `score.service.ts` without updating `docs/spec.md` first
- Do **not** commit `.env` files — only `.env.example` with placeholder values

---

## File Ownership / Path Context

| Path pattern                             | What it does                               |
|------------------------------------------|--------------------------------------------|
| `src/server/services/tmdb.service.ts`    | TMDB API client with rate limiting         |
| `src/server/services/openai.service.ts`  | GPT-4o question generation                 |
| `src/server/services/game.service.ts`    | Game session state machine                 |
| `src/server/services/score.service.ts`   | Deterministic scoring algorithm            |
| `src/server/services/difficulty.service.ts` | ELO-lite difficulty adaptation          |
| `src/server/db/schema.ts`               | Single source of truth for DB schema       |
| `src/shared/types/`                      | Types shared by client and server          |
| `docs/spec.md`                           | Authoritative API + data model reference   |
