# Risk Register & Mitigations

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **PostgreSQL Outage** | Critical | Database connection pool retries, automated health probes (`/ready`), point-in-time backup recovery scripts. |
| **Redis Cache Outage** | High | Graceful fallback to direct PostgreSQL queries for session & permission verification. |
| **AI Provider Unavailable** | Medium | Advisory fallback response with informative user message; deterministic rules engine continues operating normally. |
| **Plugin Compatibility Breakage** | Medium | Kernel Manifest version compatibility check on app startup. |
| **Migration Failure** | High | Transactional schema migrations with rollback testing. |
