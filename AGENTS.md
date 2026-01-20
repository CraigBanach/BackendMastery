# AGENTS.md

This file provides build/test commands and style guidance for agentic coding tools.
Keep changes minimal, follow existing patterns, and update docs when behavior changes.

## Repository Structure
- `PersonifiBackend/` is the .NET 9 Web API (Clean Architecture style).
- `PersonifiBackend/src/PersonifiBackend.Core` holds entities, DTOs, and interfaces.
- `PersonifiBackend/src/PersonifiBackend.Application` holds services, mapping, helpers.
- `PersonifiBackend/src/PersonifiBackend.Infrastructure` holds EF Core, repositories.
- `PersonifiBackend/tests/` contains API and application test projects.
- `personifi-app/` is the Next.js frontend (app router).
- `personifi-app/src/app` hosts routes; `src/components` hosts UI components.
- `personifi-app/src/lib` contains API helpers, hooks, and utilities.
- `full-stack-integration-tests/` contains Playwright-based E2E tests.
- `integration-tests/` holds fixtures/certs for integration flows.
- `docs/adr/` contains architecture decision records.

## Commands
### Backend (.NET)
- Build solution: `cd PersonifiBackend && dotnet build`.
- Run all tests: `cd PersonifiBackend && dotnet test`.
- Run integration tests only: `cd PersonifiBackend && dotnet test --filter "Category=Integration" --settings integration-tests.runsettings`.
- Run a single test project: `cd PersonifiBackend && dotnet test tests/PersonifiBackend.Api.Tests/PersonifiBackend.Api.Tests.csproj`.
- Run a single test class: `cd PersonifiBackend && dotnet test --filter "FullyQualifiedName~BucketServiceTests"`.
- Run a single test method: `cd PersonifiBackend && dotnet test --filter "FullyQualifiedName~BucketServiceTests.CreateAsync"`.
- Filter by namespace: `cd PersonifiBackend && dotnet test --filter "FullyQualifiedName~PersonifiBackend.Application.Tests"`.

### Frontend (Next.js)
- Install deps: `cd personifi-app && npm install`.
- Dev server: `cd personifi-app && npm run dev`.
- Lint: `cd personifi-app && npm run lint`.
- Typecheck: `cd personifi-app && npx tsc --noEmit`.
- Build: `cd personifi-app && npm run build`.
- Start: `cd personifi-app && npm run start`.
- Lint a single file: `cd personifi-app && npx eslint src/components/buckets/bucketsTable.tsx`.

### Full-Stack Integration (Docker + Playwright)
- Start stack: `docker compose -f docker-compose.test.yml up -d --build`.
- Stop stack: `docker compose -f docker-compose.test.yml down`.
- Install Playwright deps: `cd full-stack-integration-tests && npm install`.
- Run all E2E tests: `cd full-stack-integration-tests && npx playwright test`.
- Run a single spec: `cd full-stack-integration-tests && npx playwright test tests/buckets.spec.ts`.
- Run a single test by name: `cd full-stack-integration-tests && npx playwright test -g "creates bucket"`.
- Run one browser: `cd full-stack-integration-tests && npx playwright test --project=chromium`.
- View report: `cd full-stack-integration-tests && npx playwright show-report`.
- View trace: `cd full-stack-integration-tests && npx playwright show-trace test-results\\path-to-trace.zip`.

## C# Code Style (.NET)
- Use file-scoped namespaces and top-of-file `using` directives.
- Keep public types/methods in PascalCase; local variables in camelCase.
- Private fields use `_camelCase` and are `readonly` when possible.
- Prefer `async`/`await` and suffix async methods with `Async`.
- Keep DTOs in `PersonifiBackend.Core.DTOs` and map in Application layer.
- Favor constructor injection with `ILogger<T>` where logging is needed.
- Use structured logging: `_logger.LogInformation("... {Value}", value)`.
- Prefer early returns for guard clauses in controllers/services.
- Use `ActionResult<T>` for API responses; return `BadRequest`, `NotFound`, etc.
- Leverage central error handling via `ErrorHandlingMiddleware` for exceptions.
- Throw domain exceptions from Core (e.g., `DuplicateResourceException`).
- Avoid swallowing exceptions; log and rethrow only when needed.
- Keep EF Core queries in repositories; avoid direct DbContext in controllers.
- Use nullable reference types; avoid `!` unless absolutely necessary.
- Favor explicit types for public APIs; `var` is fine for locals.
- Keep XML doc comments in controllers for public endpoints.
- Keep line length reasonable; break long argument lists onto new lines.

## C# Formatting & Layout
- Insert a blank line between `using` blocks and the namespace.
- Align chained method calls vertically when they span lines.
- Keep guard clauses compact; use braces for multi-line branches.
- Prefer `if (condition) return ...;` for simple checks.
- Keep constructor parameter lists one item per line when long.
- Use `readonly` for injected dependencies and cached services.

## C# Design Patterns
- Entities live in Core, services in Application, persistence in Infrastructure.
- Avoid cross-layer dependencies (Core should not depend on Infrastructure).
- Use repositories for data access and encapsulate EF Core logic.
- Use AutoMapper profiles in Application for DTO/entity transforms.
- Keep services focused on orchestration, not HTTP concerns.
- Guard input early in controllers; leave business rules in services.

## Backend API Conventions
- Prefer account scoping via `IUserContext` in controllers/services.
- Keep controllers thin: validation + service calls + response mapping.
- Add new DTOs in Core and map to entities in Application.
- Use `ErrorHandlingMiddleware` for exception-to-response mapping.
- Log state changes and key reads with structured logging.

## TypeScript/React Style (Next.js)
- Default to server components; add `"use client"` only when needed.
- Use `"use server"` in server actions/modules as shown in API helpers.
- Import from `@/` alias for `src` paths; keep relative imports local.
- Order imports: external packages, then `@/` aliases, then relatives.
- Use PascalCase for components/types and camelCase for variables/functions.
- Prefer `const` and arrow functions; avoid `any` in strict TS.
- Keep interfaces/types in `src/types` or colocated with feature files.
- Use `fetch` helpers in `src/lib/api` with auth headers and error mapping.
- Throw `Error` in API helpers when `response.ok` is false.
- Keep JSX formatting consistent with two-space indent and semicolons.
- Use Tailwind classes via `className` strings; avoid inline styles unless needed.
- Prefer small, focused components and reusable UI primitives in `src/components/ui`.

## Frontend Formatting
- Use double quotes for strings and JSX props.
- Keep imports grouped with a blank line between sections.
- Prefer `async`/`await` over `.then` chains.
- Use `??` or `||` for fallback values as seen in components.
- Keep render blocks readable; extract helpers for complex logic.
- Keep inline style usage minimal and component-scoped.

## Frontend Conventions
- Use `@/lib/api` helpers for authenticated API calls.
- Read auth context via `getAccessToken` before calling the backend.
- Keep client-only hooks/components explicitly marked with `"use client"`.
- Preserve existing layout structure under `src/app/(app)` and `src/app/(marketing)`.
- Prefer functional components and avoid class components.
- Keep strings and numeric formats consistent with existing helpers.

## Frontend Data Flow
- Centralize backend fetches in `src/lib/api/*` files.
- Keep `fetch` options consistent: `cache: "no-store"` and JSON headers.
- Prefer typed DTOs from `src/types` for API boundaries.
- Map API errors to user-friendly messages in client components.
- Use `use`-prefixed hooks for shared stateful logic.
- Avoid direct `process.env` access in client components.

## Error Handling Patterns
- Backend: map exceptions to HTTP responses in `ErrorHandlingMiddleware`.
- Backend: validate inputs early and return `BadRequest` for invalid parameters.
- Frontend: surface API errors from fetch helpers and handle in UI.
- Playwright: rely on base URL `http://localhost:3000` and expect retries on CI.

## Testing Guidance
- Backend tests are xUnit; integration tests use `Category=Integration`.
- Use `integration-tests.runsettings` for integration test configuration.
- E2E tests live in `full-stack-integration-tests/tests/*.spec.ts`.
- Playwright stores artifacts in `full-stack-integration-tests/test-results/`.
- Prefer targeted tests and avoid unrelated fixes while iterating.

## Integration Environment
- Frontend runs at `http://localhost:3000` in Docker/test stack.
- Backend API runs at `http://localhost:5000` with Swagger at `/swagger`.
- Mock OIDC server runs at `https://localhost:4001`.
- Postgres listens on `localhost:5435` in Docker tests.
- Playwright expects the stack to be running before tests.

## Documentation & Configuration
- Update `docs/adr/` when architectural changes are made.
- Do not commit secrets; use `appsettings.Development.json` or env vars.
- Prefer Docker stack for local full-stack integration testing.
- Next.js uses strict TypeScript settings in `personifi-app/tsconfig.json`.

## Cursor/Copilot Rules
- No `.cursor/rules`, `.cursorrules`, or `.github/copilot-instructions.md` found.
