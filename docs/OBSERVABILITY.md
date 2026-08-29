# 📡 DWPTS Observability, Telemetry & Monitoring Architecture

## 1. Structured Logging (Serilog)
All API requests are enriched with contextual identifiers:
- `X-Correlation-ID`: End-to-end trace identifier injected on every HTTP request.
- `UserId` & `TenantId`: Authenticated actor metadata.
- `DurationMs`: Server-side execution duration.

## 2. Health & Readiness Probes
- `/health`: Liveness probe verifying Web API status, Database connectivity, and Redis cache.
- `/swagger`: Interactive OpenAPI 3.0 documentation console.
- `/monitoring`: Dedicated Admin observability dashboard displaying live endpoint latency matrix.
