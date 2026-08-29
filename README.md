# ⚡ DWPTS — Daily Work Planning, Capacity Management & Observability Platform

[![.NET 8 Backend CI](https://github.com/palashmore/DWPTS/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/palashmore/DWPTS/actions/workflows/backend-ci.yml)
[![Angular 18 Frontend CI](https://github.com/palashmore/DWPTS/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/palashmore/DWPTS/actions/workflows/frontend-ci.yml)
[![Security Scan](https://github.com/palashmore/DWPTS/actions/workflows/security.yml/badge.svg)](https://github.com/palashmore/DWPTS/actions/workflows/security.yml)
[![Angular 18](https://img.shields.io/badge/Angular-18.0-DD0031.svg?logo=angular)](https://angular.dev)
[![ASP.NET Core 8](https://img.shields.io/badge/ASP.NET_Core-8.0-512BD4.svg?logo=dotnet)](https://dotnet.microsoft.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1.svg?logo=postgresql)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D.svg?logo=redis)](https://redis.io)
[![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-7.5-231F20.svg?logo=apachekafka)](https://kafka.apache.org)
[![SignalR](https://img.shields.io/badge/SignalR-Realtime-512BD4.svg)](https://dotnet.microsoft.com)

**DWPTS (Daily Work Planning & Tracking System)** is an enterprise-grade operational workforce management, capacity forecasting, and observability suite designed for high-performance engineering organizations.

---

## 🌐 Live Production Deployments

- 🖥️ **Frontend SPA (Vercel Global Edge)**: [https://dwpts.vercel.app](https://dwpts.vercel.app)
- 🚀 **REST API Server (Render Cloud)**: [https://dwpts.onrender.com](https://dwpts.onrender.com)
- 📖 **Interactive OpenAPI / Swagger**: [https://dwpts.onrender.com/swagger/index.html](https://dwpts.onrender.com/swagger/index.html)
- 📦 **GitHub Source Repository**: [https://github.com/palashmore/DWPTS](https://github.com/palashmore/DWPTS)

---

## 🏛️ System Architecture

DWPTS adheres strictly to **Clean Architecture**, **Domain-Driven Design (DDD)**, and **CQRS**:

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Layer (Angular 18 Standalone)"]
        UI["Executive UI (10 Feature Modules)"]
        Signals["Signal-driven State & RxJS Streams"]
        SignalRListener["SignalR WebSockets Listener"]
        ThemeEngine["6 Centralized Design Token Themes"]
    end

    subgraph ApiLayer["API & Gateways (ASP.NET Core 8)"]
        Controllers["API v1 REST Controllers"]
        CorrelationMW["CorrelationId & Traceability Middleware"]
        SecurityMW["Security Headers & RateLimiter"]
        NotificationHub["SignalR Real-Time Hub"]
    end

    subgraph AppLayer["Application & Domain Core"]
        CQRS["CQRS Commands & Queries"]
        DomainEvents["Domain Events (WorkEntryCreated, CapacityExceeded)"]
        CapacityEngine["Statistical Forecasting Engine (EMA)"]
        ValidationPipe["FluentValidation Pipeline"]
    end

    subgraph InfraLayer["Infrastructure & Distributed Services"]
        EFCore["EF Core 8 Multi-Provider DBContext"]
        RedisService["Redis Cache-Aside Service"]
        KafkaBus["Kafka Event Bus & Async Consumers"]
        BgJobs["Hosted Background Calculation Jobs"]
        SerilogOTel["Serilog & OpenTelemetry Telemetry"]
    end

    subgraph StorageLayer["Persistence & Message Brokers"]
        PostgresDB[("PostgreSQL 16 (Production) / SQLite (Dev)")]
        RedisDB[("Redis 7 In-Memory Cache")]
        KafkaStream[("Apache Kafka Event Stream")]
    end

    UI -->|HTTPS / REST| Controllers
    SignalRListener <-->|WebSockets| NotificationHub
    Controllers --> CorrelationMW --> SecurityMW --> CQRS --> AppLayer
    AppLayer --> InfraLayer
    InfraLayer --> EFCore --> PostgresDB
    InfraLayer --> RedisService --> RedisDB
    InfraLayer --> KafkaBus --> KafkaStream
    InfraLayer --> BgJobs
```

---

## 🌟 Key Technical Capabilities

### 1. 📈 Statistical Capacity & Workload Forecasting
- Multi-factor available capacity formulation:
  $$	ext{Available Capacity} = (	ext{Working Days} - 	ext{Holidays} - 	ext{Leaves}) 	imes 	ext{Daily Capacity Limit}$$
- **Exponential Moving Average (EMA)** workload forecasting engine predicting 30-day team utilization and overtime risk.

### 2. 🛡️ Multi-Tenant Privacy & RBAC Isolation
- Server-side **EF Core Global Query Filters** ensuring employees strictly view only self-logged tasks.
- Dedicated Admin employee switcher for organization-wide oversight.

### 3. ⚡ Distributed Caching & Event-Driven Architecture
- **Redis Distributed Cache** with cache-aside and automatic TTL for master taxonomy, holidays, and aggregates.
- **Kafka Event Streaming** publishing asynchronous domain events (`WorkEntryCreatedEvent`, `ExcelImportCompletedEvent`, `CapacityThresholdExceededEvent`).

### 4. 🔔 SignalR Real-Time Telemetry
- Real-time WebSocket notifications dispatched to connected clients upon task creation, capacity breach, or batch import completion.

### 5. 📡 API Monitoring & Observability Platform (`/monitoring`)
- Live backend health probe, roundtrip latency benchmark, database telemetry, and real-time request traffic trace.

---

## 🔑 Production Demo Credentials & RBAC Matrix

| Role | Username | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| 🛡️ **ADMIN** | `admin` | `Admin@123` | **Full System Access**: User Directory (`/admin`), API Monitoring (`/monitoring`), Excel Importer (`/import`), Org-Wide Filters |
| 👔 **MANAGER** | `manager` | `Manager@123` | **Team Oversight**: Capacity Forecasts, Work Items Backlog, Master Data, Reports |
| 👨‍💻 **EMPLOYEE** | `employee` / `pallavi` / `sagar` | `Employee@123` (or set password) | **Strict Personal Work View**: Daily Work Planning, Monthly Calendar, Personal Reports |

---

## 🚀 Quickstart & Local Development

### 1. Run Everything with Docker Compose (1-Command Launch)
```bash
docker compose up -d
```
- Frontend UI: `http://localhost`
- Backend API: `http://localhost:5000` (Swagger: `http://localhost:5000/swagger`)
- PostgreSQL: `localhost:5432` | Redis: `localhost:6379` | Kafka: `localhost:9092`

### 2. Local Manual Run
```powershell
# Run Backend API (.NET 8)
cd src/DWPTS.Api
dotnet run

# Run Frontend Application (Angular 18)
cd client/dwpts-angular
npm install
npm start
```

### 3. Execute Automated Test Suite
```powershell
dotnet test
```

---

## 🎨 Enterprise Themes

DWPTS features 6 built-in luxury themes switchable via the **`🎨 Theme`** selector in the top navbar:
1. **Midnight Luxury** (Navy Deep & Champagne Gold)
2. **Royal Indigo** (Royal Indigo & Electric Violet)
3. **Executive Graphite** (Charcoal Carbon & Amber Gold)
4. **Ocean Luxe** (Abyss Blue & Luminous Cyan)
5. **Emerald Elite** (Forest Jade & Radiant Emerald)
6. **Platinum Light** (Crisp Canvas & Slate Gold)

---

## 📚 Technical Documentation

- 🏛️ [Architecture Specification](docs/architecture.md)
- 🔒 [Security & RBAC Specification](docs/SECURITY.md)
- 🗄️ [Database ERD & Schema](docs/DATABASE.md)
- 📡 [API Specification & Endpoints](docs/API.md)
- 📊 [Observability & Monitoring Guide](docs/OBSERVABILITY.md)
- 🚢 [Production Deployment Guide](docs/deployment-guide.md)

---

## 📄 License
Licensed under the [MIT License](LICENSE).
