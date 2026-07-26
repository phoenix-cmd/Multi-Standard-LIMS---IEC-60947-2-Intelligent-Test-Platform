# Performance Budget & SLAs

The platform enforces the following performance targets:

| SLA Metric | Target SLA |
| :--- | :--- |
| **Standard API Endpoint SLA** | `< 200 ms` |
| **Authentication SLA** | `< 500 ms` (Argon2 verify + JWT cookie) |
| **Real-Time WebSocket Event SLA** | `< 1000 ms` delivery |
| **Report Generation SLA** | `< 10 seconds` PDF compilation |
| **Search & EQL SLA** | `< 1000 ms` query evaluation |
| **System Uptime Target** | `99.9%` |
| **TypeScript Compilation** | `0 errors` (`npx tsc --noEmit`) |
