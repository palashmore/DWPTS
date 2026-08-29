# 🔒 DWPTS Security, Authentication & Authorization Architecture

## 1. Authentication Pipeline
- **JWT (JSON Web Tokens)** with HMAC-SHA256 digital signatures.
- **Refresh Token Rotation**: Short-lived access tokens (1 hour) with rotating refresh tokens (7 days).
- **Password Hashing**: BCrypt with work factor 12.

## 2. Multi-Tenant Authorization & Data Privacy
- **Zero Trust Client ID**: TenantId and UserId are derived exclusively from the verified server-side JWT claims.
- **EF Core Global Query Filters**: Enforces strict row-level isolation preventing IDOR (Insecure Direct Object Reference).

## 3. API Hardening & Resilience
- **Rate Limiting**: Fixed-window token bucket policy (100 req/min).
- **Security Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
