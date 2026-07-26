# Core Architecture Principles

The Engineering Operating System (EOS) is governed by 7 core architectural principles:

1. **Kernel before Platform**: Generic, reusable engineering capabilities belong in `src/kernel/`. Domain-specific laboratory behavior belongs in `src/platform/`.
2. **Domain before Infrastructure**: Business rules and domain models must never depend directly on databases, ORMs, or web frameworks.
3. **Events are Immutable**: Published domain events are append-only contracts and must never be modified in-place.
4. **Plugins Extend, Never Modify**: Test standards (e.g., IEC 60947-2, UL 489) extend the system via public extension points without modifying core kernel code.
5. **AI Advises, Deterministic Engines Decide**: Compliance evaluation, formula calculations, and rule evaluations are strictly deterministic. AI provides advisory, root-cause, and natural-language capabilities.
6. **Everything Observable**: All APIs, background queues, WebSocket handlers, and workers expose health metrics and structured correlation logging.
7. **Backward Compatibility**: Public APIs, event schemas, and plugin extension interfaces are versioned (`/api/v1/`, `Event.v1`).
