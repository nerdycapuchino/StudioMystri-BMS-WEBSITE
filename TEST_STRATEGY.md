# Test Strategy for Studio Mystri BMS

## Overview

This document outlines the testing strategy for the Studio Mystri BMS project. The goal is to ensure high quality, reliability, and security of the application by implementing a robust testing framework across both backend and frontend.

## 1. Testing Pyramid

We will adhere to the testing pyramid, prioritizing Unit Tests for speed and coverage, followed by Integration Tests for critical paths, and End-to-End (E2E) Tests for user flows.

### 1.1 Backend Testing (Node.js / Express / Prisma)

*   **Tools:** `vitest` (Test Runner), `supertest` (API Testing), `pg-mem` (Mock DB for memory).
*   **Unit Tests:**
    *   **Goal:** Verify individual functions and services in isolation.
    *   **Scope:**
        *   `modules/*/service.ts`: Business logic (calculations, state transitions).
        *   `utils/*.ts`: Helper functions (validation, formatting).
    *   **Example:** `auth.service.test.ts` mocking `prisma.user.findUnique`.
*   **Integration Tests:**
    *   **Goal:** Verify API endpoints and database interactions.
    *   **Scope:**
        *   `modules/*/controller.ts` via `routes.ts`.
        *   Test proper HTTP status codes (200, 400, 401, 403, 500).
        *   Test input validation (e.g., malformed JSON, missing fields).
        *   Test authorization (role-based access).
    *   **Environment:** Use a separate test database (PostgreSQL container) or `pg-mem`.

### 1.2 Frontend Testing (React / Vite)

*   **Tools:** `vitest` (Runner), `@testing-library/react` (Component Testing), `msw` (Mock Service Worker).
*   **Unit Tests:**
    *   **Goal:** Verify component rendering and logic.
    *   **Scope:**
        *   `components/ui/*.tsx`: Reusable UI components.
        *   `hooks/*.ts`: Custom hooks logic.
        *   `utils/*.ts`: Frontend utility functions.
*   **Integration Tests:**
    *   **Goal:** Verify user interactions within components.
    *   **Scope:**
        *   Form submissions (Login, Create Order).
        *   Navigation (Dashboard -> Details).
        *   Error handling (API failure toast notifications).

### 1.3 End-to-End (E2E) Testing

*   **Tools:** `Playwright` or `Cypress`.
*   **Goal:** Verify critical user journeys across the full stack.
*   **Scope:**
    *   Login -> Dashboard -> Logout.
    *   Create Customer -> Create Order -> View Invoice.
    *   Admin Settings -> Update Logo -> Verify Reflection.
*   **Environment:** Run against a staging environment or Dockerized local setup.

## 2. Implementation Plan

### Phase 1: Setup & Sanity Checks (Immediate)
1.  **Dependencies:** Install `vitest`, `supertest`, `@types/supertest` in backend. Install `vitest`, `@testing-library/react`, `jsdom` in frontend.
2.  **Configuration:** Configure `vitest.config.ts` for both projects.
3.  **Sanity Test:** Create a simple test file in both projects to ensure the runner works.

### Phase 2: Critical Path Coverage (Week 1)
1.  **Backend Auth:** Write integration tests for `/auth/login`, `/auth/refresh`, `/auth/logout`.
2.  **Frontend Auth:** Write component tests for `Login.tsx` (mocking API calls).
3.  **Backend User Management:** Integration tests for `/admin/users` (CRUD).

### Phase 3: Core Business Logic (Week 2)
1.  **Orders & Invoices:** Unit tests for calculation logic (totals, taxes).
2.  **Customer Management:** Integration tests for customer creation and search.

## 3. CI/CD Integration

*   **Pre-commit Hook:** Run `lint` and `typecheck` (using `husky` + `lint-staged`).
*   **Pull Request:** GitHub Action to run:
    1.  `npm run typecheck` (Backend & Frontend)
    2.  `npm run lint`
    3.  `npm run test` (Unit & Integration)
    4.  `npm run build` (Frontend)

## 4. Test Data Management

*   **Seeding:** Use `prisma/seed.ts` to populate test data.
*   **Cleanup:** Ensure tests clean up created data (transaction rollback or database reset) to maintain isolation.

## 5. Reporting

*   **Coverage:** Aim for 80% coverage on backend services and utils.
*   **Flakiness:** Monitor and fix flaky tests immediately.
