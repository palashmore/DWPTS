# DWPTS Architecture & Technical Overview

## 1. High-Level Architecture
DWPTS follows Clean Architecture / Onion Architecture principles:

- **DWPTS.Shared**: Common models, API wrappers, enums, constants, and pagination primitives.
- **DWPTS.Domain**: Pure business entities, aggregates, and domain rules without framework dependencies.
- **DWPTS.Application**: DTOs, business calculations engine, FluentValidation validators, and application service interfaces.
- **DWPTS.Infrastructure**: EF Core `DWPTSDbContext`, repository implementations, Excel import parser (ExcelDataReader & ClosedXML), CSV exporter, PDF exporter, JWT auth, and BCrypt security.
- **DWPTS.API**: ASP.NET Core REST API, Controllers, Global Exception Middleware, Swagger OpenAPI, Serilog structured logging.
- **Angular SPA**: Standalone Angular 18/19 Material components, Chart.js analytics, reactive state, HTTP interceptors, route guards.
