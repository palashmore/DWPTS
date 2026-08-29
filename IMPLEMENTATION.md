# 📑 DWPTS Enterprise Architecture & Implementation Guide
**Daily Work Planning & Tracking System (DWPTS) — Operational Enterprise Suite**

---

## 🏛️ 1. Architecture & Tech Stack Overview

DWPTS is a full-stack, enterprise-grade workload management, capacity tracking, and multi-theme operational suite built with modern cloud architectures:

- **Frontend**: **Angular 18 Standalone** with RxJS, TypeScript, centralized SCSS design tokens, and multi-theme customization.
- **Backend**: **ASP.NET Core 8 Web API** with C# 12, Entity Framework Core 8, JWT Bearer authentication, and Swagger OpenAPI 3.0.
- **Database**: **SQLite Enterprise Database** with automatic schema migrations and master taxonomy seed data.
- **Hosting & CI/CD**:
  - **Frontend Application**: Vercel Global Edge CDN 👉 [https://dwpts.vercel.app](https://dwpts.vercel.app)
  - **Backend API Server**: Render Cloud Web Service 👉 [https://dwpts.onrender.com](https://dwpts.onrender.com)
  - **Interactive Swagger Docs**: [https://dwpts.onrender.com/swagger/index.html](https://dwpts.onrender.com/swagger/index.html)
  - **GitHub Repository**: [https://github.com/palashmore/DWPTS](https://github.com/palashmore/DWPTS)

---

## 🚀 2. Complete GitHub Commands to Connect & Push

Use the following terminal commands to connect your local environment directly to the GitHub repository:

### 2.1. Navigate to Project Directory
```powershell
cd C:\Users\palashm\.gemini\antigravity\scratch\DWPTS
```

### 2.2. Configure Remote URL with GitHub Token
```powershell
git remote set-url origin https://<YOUR_GITHUB_TOKEN>@github.com/palashmore/DWPTS.git
```

### 2.3. Stage, Commit & Push Latest Code
```powershell
# Stage all changes
git add .

# Create commit
git commit -m "DWPTS Full Enterprise Release: Multi-Tenant Data Privacy, API Monitoring, Multi-Theme & Admin Actions"

# Ensure main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## 💻 3. Local Build & Run Instructions

### 3.1. Frontend Application (Angular 18)
```powershell
cd C:\Users\palashm\.gemini\antigravity\scratch\DWPTS\client\dwpts-angular

# Install dependencies
npm install

# Start local dev server
npm start
# App runs at: http://localhost:4200

# Build production bundle
npm run build
```

### 3.2. Backend REST API (.NET 8.0)
```powershell
cd C:\Users\palashm\.gemini\antigravity\scratch\DWPTS\src\DWPTS.Api

# Restore & build solution
dotnet build

# Run API server locally
dotnet run
# API runs at: https://localhost:7001 (Swagger: /swagger/index.html)
```

---

## 🎨 4. Multi-Theme Customization Engine

Users can switch between 6 coordinated enterprise themes using the **`🎨 Theme`** selector in the top navbar:

| # | Theme Name | Visual Identity | Target Users |
| :-: | :--- | :--- | :--- |
| **1** | **Midnight Luxury** | Navy Deep (`#07111F`) + Champagne Gold (`#D6B36A`) | Executive Leadership |
| **2** | **Royal Indigo** | Royal Indigo (`#0B0E23`) + Electric Violet (`#8B5CF6`) | Product & Engineering |
| **3** | **Executive Graphite** | Charcoal Carbon (`#0F1115`) + Amber Gold (`#F59E0B`) | C-Suite & Operations |
| **4** | **Ocean Luxe** | Abyss Blue (`#041525`) + Luminous Cyan (`#06B6D4`) | Cloud Infrastructure |
| **5** | **Emerald Elite** | Forest Jade (`#061A14`) + Radiant Emerald (`#10B981`) | Project Management |
| **6** | **Platinum Light** | Crisp Canvas (`#F1F5F9`) + Slate + Gold | High-illumination Environments |

---

## 🔒 5. Production Credentials & Role Matrix

| Username / Identifier | Password | Role | Permissions & Access Scope |
| :--- | :--- | :---: | :--- |
| **`admin`** | **`Admin@123`** | 🛡️ **ADMIN** | **Full System Access**: User Management (`/admin`), API Monitoring (`/monitoring`), Excel Importer (`/import`), Org-Wide Filters, System Parameters |
| **`manager`** | **`Manager@123`** | 👔 **MANAGER** | **Team Oversight**: Departmental Capacity Dashboard, Work Items Backlog, Master Data, Reports |
| **`employee`** / **`pallavi`** / **`sagar`** | **`Employee@123`** (or created password) | 👨‍💻 **EMPLOYEE** | **Strict Personal Work View**: Daily Work Planning, Task Logging, Monthly Calendar, Personal Reports. *Cannot see other employees' tasks or Admin pages.* |

---

## 🌟 6. Core Modules Breakdown

1. **Daily Work Engine (`/daily-work`)**:
   - Multi-task effort tracking: $\text{Total Effort} = \text{Work Effort} + \text{Meeting Effort}$.
   - Smart regex parser for task identifiers (e.g. `Task 358112: Dev...` $\rightarrow$ `#358112`).
   - One-click **`🗑️ Clear All Today`** and individual row actions (`✏️ Edit`, `📑 Duplicate`, `🗑️ Delete`).
   - Admin employee switcher dropdown (`Viewing Work for: All Team Members / Specific Employee`).

2. **Multi-Tenant Data Isolation (`/work-entries`)**:
   - **Employees** see only their personal logged work entries.
   - **Admins** see organization-wide records and can filter by employee using the **`Filter by Employee`** selector.

3. **Monthly Planning Calendar (`/calendar`)**:
   - Dynamic 7-column calendar computing working days, weekends, holidays, leaves, and daily planned vs actual effort.
   - Interactive day cards routing directly into `/daily-work`.

4. **Multi-Month Excel Importer (`/import`)**:
   - Parses multi-sheet workbooks (`AUG 2026`, `JUL 2026`, `JUN 2026`, `MAY 2026`, `AllData`).
   - **`IMPORT FOR:`** selector allows assigning imported historical data to **`🌐 All Employees (Universal Org Baseline)`** or to a specific employee.

5. **User Administration & Permissions (`/admin`)**:
   - Live **Active User & Employee Directory** with **`✏️ Edit User & Permissions`** (update details and reset passwords) and **`🗑️ Delete User`**.
   - Immutable security and change audit trail.

6. **API Monitoring & Observability Platform (`/monitoring`)**:
   - Real-time backend health pings (`🟢 200 OK` at `https://dwpts.onrender.com/health`).
   - Roundtrip latency tracking (ms) across all core REST endpoints.
   - Live authenticated request traffic stream and infrastructure service topology.
