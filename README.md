# DWPTS — Daily Work Planning & Tracking System

Enterprise-grade full-stack solution for daily work planning, multi-task tracking, meeting analysis, capacity management, and Excel import/export.

---

## 🚀 Quick Start

### 1. Backend (ASP.NET Core Web API)
```bash
cd src/DWPTS.API
dotnet run
```
API runs on `http://localhost:5000` with Swagger UI at `http://localhost:5000/swagger`.

### 2. Frontend (Angular SPA)
```bash
cd client/dwpts-angular
npm start
```
Frontend runs on `http://localhost:4200`.

### 3. Demo Credentials
- **Admin**: `admin` / `Admin@123`
- **Manager**: `manager` / `Manager@123`
- **Employee**: `employee` / `Employee@123`

---

## 🧪 Running Automated Tests
```bash
# Run unit tests
dotnet test tests/DWPTS.UnitTests

# Run integration tests (includes Excel import verification)
dotnet test tests/DWPTS.IntegrationTests
```

---

## 🐳 Docker Deployment
```bash
docker-compose up --build
```
- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:5000`
- SQL Server: `localhost:1433`
