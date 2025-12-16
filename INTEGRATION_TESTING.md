# Integration Testing Guide

This guide covers how to set up the full-stack integration environment and run the various types of tests available in the project.

## 1. Full Stack Environment (Docker)

To spin up the complete application stack (Frontend, Backend, Mock OIDC Provider, and Database), use Docker Compose. This mimics the production environment locally.

### Start the Stack
```powershell
docker compose -f docker-compose.test.yml up -d --build
```

### Services & Ports
*   **Frontend:** [http://localhost:3000](http://localhost:3000)
*   **Backend API:** [http://localhost:5000](http://localhost:5000) (Swagger: [http://localhost:5000/swagger](http://localhost:5000/swagger))
*   **Mock OIDC Server:** [https://localhost:4001](https://localhost:4001)
*   **Postgres DB:** `localhost:5435`

### Stop the Stack
```powershell
docker compose -f docker-compose.test.yml down
```

---

## 2. Full-Stack Integration Tests

These tests use **Playwright** to verify application flows from the frontend against an ephemeral backend and database environment.

**Prerequisites:**
*   The **Full Stack Environment** (Docker) must be running (see section 1).
*   Node.js installed.

### Run Tests
Navigate to the test directory and run the tests:

```powershell
cd full-stack-integration-tests
npm install # Install dependencies if first time
npx playwright test
```

### View Report
To see the HTML report of the test run:
```powershell
npx playwright show-report
```

---

## 3. Backend Integration Tests (.NET)

These tests target the API endpoints directly using `WebApplicationFactory`.

**Note:** The backend integration tests are currently configured to use an **In-Memory Database** and Mock Authentication. They **do NOT** require the Docker stack to be running.

### Run Tests
```powershell
cd PersonifiBackend
dotnet test --filter "Category=Integration" --settings integration-tests.runsettings
```

For more details on backend testing strategies, see [PersonifiBackend/TEST_SEPARATION.md](PersonifiBackend/TEST_SEPARATION.md).
