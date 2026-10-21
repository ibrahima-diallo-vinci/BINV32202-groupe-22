# Copilot instructions

## Project commands

Run commands from the repository root. Node.js 22.14 or newer is required (Node 24 LTS is recommended).

```bash
npm ci
npm run setup       # Create backend/.env if needed and initialize the demo database
npm run dev         # API on :3000 and Vite app on :5173
npm run check       # Lint, typecheck, tests, and build
```

Individual checks are also available as `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. To run one test file:

```bash
npm run test -w backend -- tests/offers.test.ts
npm run test -w frontend -- tests/OffersPage.test.tsx
```

Pass `-t "<test name>"` after the file path to filter to a named Vitest test. Backend tests use an in-memory SQLite database; do not point them at the development database. `npm run db:reset` recreates the local database and its demo data; stop the dev server first, particularly on Windows.

## Architecture

Gesta is an npm-workspaces TypeScript application: `backend/` is an Express API backed by SQLite, and `frontend/` is a React app built with Vite. In development, the frontend calls `/api/...`; Vite proxies to the API on port 3000 and strips `/api`.

The backend is assembled in `backend/src/app.ts` by injecting a shared database through repository, service, and controller factories. The request path is controller (HTTP validation and response) → service (business rules and permissions) → repository (SQL and database-row/DBO results); mappers convert between database records, domain objects, and API DTOs. Services must not depend on Express `Request` or `Response`. `HttpError` exceptions are converted by the centralized error middleware to the documented JSON error format. See `docs/architecture.md` and `backend/API.md` before changing a flow that crosses layers.

The frontend follows the course MVVM structure: pages compose reusable components and hooks; hooks manage view/session state; services make HTTP requests and validate response JSON with type guards; models describe API data. `App.tsx` owns the single `useAuth` call and passes the session to pages. Hooks notify the app on 401 so it can log out.

## Repository-specific conventions

- Backend imports use `.ts` extensions; TypeScript rewrites them to `.js` in the build.
- Authentication sends the token as the raw `Authorization` header value, with no `Bearer` prefix. The token identifies the account only; the backend reloads account status, roles, and company relationships from the database for each request. Authorization belongs on the server, not just in frontend visibility checks.
- Raise expected API errors with `throw new HttpError(status, code, message)` and let the shared middleware format them.
- Keep business rules in services and SQL in repositories. SQLite enforces schema constraints; workflow rules and access decisions belong in services.
- Database migrations are ordered, one-time SQL files under `backend/src/db/migrations/`. Add a new numbered migration for schema changes; do not edit an applied migration.
- Demo records live under `backend/src/db/seed/`; use the stable identifiers in `seedIds.ts` in tests. Backend tests create a migrated, seeded in-memory database via `tests/helpers/testApp.ts`; frontend tests use Vitest, Testing Library, and `tests/helpers/fetchMock.ts`.
- Persist status codes in English; present their French labels in the frontend.
- Demo login is intentionally not real authentication and must remain development-only; the backend refuses to start with demo auth enabled in production.

The project is intentionally incomplete relative to its requirements. Check `README.md` for what is implemented and `docs/cdc_gesta_developpement.md` for the requirements before assuming a feature exists or extending its scope.
