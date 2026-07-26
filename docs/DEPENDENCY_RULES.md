# Architectural Dependency Rules

To prevent structural erosion over time, strict layer dependency rules are enforced:

```
Platform (src/platform/) ──> Kernel (src/kernel/) ──> Infrastructure / Shared
```

1. **Platform depends on Kernel**: Laboratory modules (`src/platform/*`) may import kernel services (`src/kernel/*`).
2. **Kernel NEVER depends on Platform**: Kernel packages (`src/kernel/*`) must be 100% generic and must NEVER import from `src/platform/*`.
3. **Domain is Infrastructure-Independent**: Core domain entities and rules must never import database client frameworks, Express response objects, or external HTTP clients directly.
