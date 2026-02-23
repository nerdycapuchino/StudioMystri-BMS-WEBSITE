# QA & QC Report

**Project:** Studio Mystri BMS
**Date:** 2025-05-18
**Auditor:** Jules

## Executive Summary

This report details the findings from a comprehensive Quality Assurance (QA) and Quality Control (QC) audit of the Studio Mystri BMS codebase. The audit covered both backend and frontend applications, focusing on functionality, security, performance, and code quality.

**Critical Finding:** The frontend application was unable to build due to an export mismatch in `App.tsx`. This has been patched to allow further testing.

**Overall Status:** The application structure is solid, using modern technologies (React, Vite, Express, Prisma, TypeScript). However, it lacks a robust testing strategy, has some security vulnerabilities regarding credentials, and requires some code cleanup.

## 1. Critical Bugs (Blockers)

### 1.1 Frontend Build Failure (FIXED)
*   **Issue:** `frontend/index.tsx` attempted to import `App` as a default export, but `frontend/App.tsx` only provided a named export `AppRouter`.
*   **Impact:** The frontend application could not be built or run.
*   **Status:** **Fixed** by adding `export default AppRouter;` to `frontend/App.tsx`.

## 2. Security Vulnerabilities

### 2.1 Hardcoded Developer Credentials
*   **File:** `frontend/components/Login.tsx`
*   **Issue:** Developer credentials (`admin@studiomystri.com / Admin@1234`) are hardcoded and displayed in the UI.
*   **Risk:** High. In a production environment, this exposes administrative access to anyone visiting the login page.
*   **Recommendation:** Remove this block or wrap it in a `if (process.env.NODE_ENV === 'development')` check.

### 2.2 Lack of Input Validation for Query Parameters
*   **File:** `backend/src/modules/*/controller.ts` (e.g., `admin.controller.ts`, `customer.controller.ts`)
*   **Issue:** Controller methods pass `req.query` directly to services cast as `Record<string, string>`.
*   **Risk:** Medium. If a malicious user sends nested objects (e.g., `?search[foo]=bar`), it could cause runtime errors in Prisma (500 Internal Server Error) or potentially bypass logic.
*   **Recommendation:** Use a validation library like `zod` to validate `req.query` structure before passing it to services.

### 2.3 Potential Token Enumeration / Timing Attacks
*   **File:** `backend/src/modules/auth/auth.service.ts`
*   **Issue:** The login function returns detailed error messages ("Invalid email or password", "Account is deactivated"). While standard, ensure consistent response times to prevent timing attacks.
*   **Recommendation:** Use a constant time comparison and generic error messages where possible, though the current implementation is acceptable for most internal tools.

## 3. Potential Bugs & Logic Issues

### 3.1 Duplicated Health Check
*   **File:** `backend/src/routes.ts` and `backend/src/app.ts`
*   **Issue:** Health check endpoint is defined in `app.ts` (root `/health`) and `routes.ts` (`/api/v1/health`).
*   **Impact:** Low. Redundant code.
*   **Recommendation:** Consolidate to a single location.

### 3.2 Logout Limitation
*   **File:** `backend/src/modules/auth/auth.controller.ts`
*   **Issue:** The `logout` endpoint requires a valid access token (`verifyToken`). If a user's access token is expired, they cannot hit the logout endpoint to clear their refresh token from the database.
*   **Impact:** Low/Medium. User might be stuck in a "logged out but can't notify server" state.
*   **Recommendation:** Allow logout with just the refresh token cookie, or ensure the frontend automatically refreshes the token before calling logout.

### 3.3 Default Environment Variables
*   **File:** `backend/src/config/env.ts`
*   **Issue:** `PORT` defaults to `'5000'`.
*   **Impact:** Low. If the environment variable is missing in production, it might default to a dev port, potentially causing port conflicts or confusion.
*   **Recommendation:** Enforce explicit configuration in production.

## 4. Performance & Code Quality

### 4.1 Missing Automated Tests
*   **Issue:** There are **zero** automated tests (Unit, Integration, or E2E) for both backend and frontend.
*   **Impact:** Critical. High risk of regression when making changes.
*   **Recommendation:** Implement a testing strategy immediately (see `TEST_STRATEGY.md`).

### 4.2 Inefficient Database Queries
*   **File:** `backend/src/modules/customers/customer.service.ts` (and potentially others)
*   **Issue:** `recalculateStats` fetches ALL orders for a customer to calculate total spent.
*   **Impact:** High. As data grows, this will become very slow and memory-intensive.
*   **Recommendation:** Use Prisma's `aggregate` function (`_sum`, `_count`) to perform calculations in the database.

### 4.3 Frontend Large Chunks
*   **Issue:** Frontend build produces chunks larger than 800kB.
*   **Impact:** Medium. Slower initial load time.
*   **Recommendation:** Implement code splitting using `React.lazy` and `Suspense` for route components.

## 5. Recommendations

1.  **Prioritize Testing:** Set up `vitest` for backend and frontend. Write tests for critical paths (Auth, Order creation).
2.  **Security Hardening:** Remove exposed credentials. Implement rate limiting on sensitive endpoints beyond the global limiter.
3.  **Refactor Queries:** Audit all `findMany` calls and loop-based calculations for performance. Use DB-level aggregation.
4.  **CI/CD:** Set up a CI pipeline to run `typecheck` and (future) tests on every push.
