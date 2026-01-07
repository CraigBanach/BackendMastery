# Repository Guidelines

## Project Structure & Module Organization
- `PersonifiBackend/` is the .NET 9 Web API (Clean Architecture style). Core entities and interfaces live in `PersonifiBackend/src/PersonifiBackend.Core`, application services in `PersonifiBackend/src/PersonifiBackend.Application`, and infrastructure (EF Core, repositories) in `PersonifiBackend/src/PersonifiBackend.Infrastructure`.
- Backend tests are in `PersonifiBackend/tests/` with separate projects for API and application layers.
- `personifi-app/` is the Next.js frontend (app router). UI components are under `personifi-app/src/components`, pages under `personifi-app/src/app`.
- `full-stack-integration-tests/` contains Playwright tests. `integration-tests/` holds fixtures and certs used by integration flows.
- Architectural decisions are documented in `docs/adr/`.

## Build, Test, and Development Commands
- Backend build: `cd PersonifiBackend && dotnet build`.
- Backend tests: `cd PersonifiBackend && dotnet test` (unit + integration), or `dotnet test --filter "Category=Integration" --settings integration-tests.runsettings` for integration-only.
- Frontend dev server: `cd personifi-app && npm run dev`.
- Frontend lint: `cd personifi-app && npm run lint`.
- Full stack (Docker): `docker compose -f docker-compose.test.yml up -d --build` (see `INTEGRATION_TESTING.md`).
- Full-stack Playwright: `cd full-stack-integration-tests && npx playwright test` (Docker stack must be running).

## Coding Style & Naming Conventions
- C# uses nullable reference types; keep public types and methods in PascalCase and private fields in camelCase.
- TypeScript/React components are PascalCase; functions/variables are camelCase.
- Prefer existing patterns in the nearest module; run `npm run lint` for frontend changes.

## Testing Guidelines
- Backend tests use xUnit with `Category` filters for integration tests.
- Full-stack tests use Playwright; keep spec files in `full-stack-integration-tests/tests/*.spec.ts`.
- No explicit coverage thresholds are defined; prioritize high-value paths and regression fixes.

## Commit & Pull Request Guidelines
- Follow existing commit style: short, imperative summaries (e.g., "Add integration suite"), optionally with PR references like `(#97)`.
- PRs should describe the change, link relevant issues, and list tests run. Include screenshots or recordings for UI changes.

## Security & Configuration Tips
- Do not commit secrets. Use `appsettings.Development.json` or environment variables for local overrides.
- For local integration testing, prefer the Docker stack in `docker-compose.test.yml`.
