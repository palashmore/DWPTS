# Excel to Database Mapping Specification

## 1. Sheet Structure Mapping
- **Monthly Sheets** (`November-2025` to `October-2026`): Maps to `WorkEntries` table.
- **AllData**: Aggregated repository with 365 daily rows for full-year tracking.
- **Weekly Summary**: Dynamic aggregations calculating total work hours, meeting hours, combined hours, working days, holidays, leaves.
- **Yearly Summary**: High-level executive dashboard matrix.

## 2. Extraction & Normalization Logic
1. **Task Numbers**: Extracted using regex `(?:Task|Bug|Ticket|CR|#)\s*(?:No\.?\s*)?([A-Za-z0-9\-_]+)[:\s\-]*(.*)`.
2. **Categories**: Normalized into `WorkEntryCategories` (Development, Bug Fix, Support, Utility, Discussion, Status).
3. **Meetings**: Normalized into `Meetings` and `MeetingTypes` (Daily Stand Up, BYD Sync Up, CRM Walkthrough, DMS Walkthrough).
4. **Holidays / Leaves**: Special task marker rows converted to `Holidays` and `EmployeeLeaves` records.
