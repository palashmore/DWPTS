# 🛡️ DWPTS AI Governance, Safety & Cost Control

## 1. Human-in-the-Loop Safeguards
- AI outputs are **strictly advisory recommendations**.
- AI never silently modifies database records, deletes work entries, or escalates permissions.
- All AI-generated work plans require explicit human approval via `[Confirm & Save]`.

## 2. Zero Direct SQL Policy
- To prevent prompt injection and unauthorized data access, the AI layer generates **structured intent specifications**, not raw SQL.
- All queries are executed by authorized backend C# handlers respecting EF Core row-level security.

## 3. Cost & Token Governance
- Token limits: Max 1,024 output tokens per request.
- Fixed-window rate limiting on AI endpoints.
- Response caching in Redis for repeated analytical summaries.
