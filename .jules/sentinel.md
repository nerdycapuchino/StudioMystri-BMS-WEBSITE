## 2026-01-24 - [Mock Authentication Bypass]
**Vulnerability:** The login component (`src/components/Login.tsx`) implemented a mock authentication check that only validated if the email string contained "admin", completely ignoring the password field. The mock user data in `src/constants.ts` also lacked password fields.
**Learning:** Development/Mock logic was implemented without basic security controls, creating a trivial bypass. Even mock auth should verify credentials to prevent bad habits and accidental exposure of insecure logic.
**Prevention:** Ensure all authentication flows, even mock ones, implement full credential validation (email AND password). Use typed interfaces (like `User` in `src/types.ts`) to enforce the presence of security-critical fields like `password`.
