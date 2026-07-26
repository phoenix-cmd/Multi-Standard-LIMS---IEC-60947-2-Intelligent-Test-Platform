# Definition of Done (DoD)

Every feature and pull request must satisfy the following criteria before being merged or considered complete:

1. **Implementation**: Core domain invariants, business logic, and API endpoints are fully implemented.
2. **Testing**: Unit tests and integration tests pass cleanly with >80% coverage on kernel packages.
3. **Type Safety**: `npx tsc --noEmit` passes with 0 compilation errors across frontend and backend.
4. **Code Quality**: ESLint passes with 0 errors and zero high/critical dependency vulnerabilities (`npm audit`).
5. **Documentation**: OpenAPI spec updated, API contracts documented in `docs/API.md`, and event definitions updated in `docs/EventsCatalog.md`.
6. **Telemetry & Audit**: Audit logging implemented for state mutations, and telemetry span contexts added.
7. **Security**: Password hashing using Argon2, input schemas validated via Zod, and authorization checks enforced per route.
