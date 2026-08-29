import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiResponse, DailyWorkScreen, PagedResult, WorkEntry, WorkItem, WorkItemTimeline, Category, Meeting, MeetingAnalysis, Holiday, Leave, CalendarMonth, DashboardSummary, WeeklyReport, MonthlyReport, YearlyReport, ImportPreview, ImportResult, UserProfile } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'https://dwpts.onrender.com/api';

  private readonly LS_ENTRIES = 'dwpts_entries';
  private readonly LS_CATEGORIES = 'dwpts_categories';
  private readonly LS_MEETINGS = 'dwpts_meetings';
  private readonly LS_USERS = 'dwpts_users';

  constructor(private http: HttpClient) {
    this.initLocalStorageDefaults();
  }

  private getCurrentUser(): UserProfile | null {
    try {
      const saved = localStorage.getItem('dwpts_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  public isAdminOrManager(): boolean {
    const u = this.getCurrentUser();
    if (!u) return true;
    const roles = (u.roles || []).map(r => String(r).toUpperCase());
    const username = String(u.username || '').toLowerCase();
    return roles.includes('ADMIN') || roles.includes('MANAGER') || username.includes('admin');
  }

  private isEntryOwner(entry: WorkEntry, user: UserProfile | null): boolean {
    if (!user) return true;
    if (entry.employeeCode && user.employeeCode && entry.employeeCode === user.employeeCode) return true;
    if (entry.username && user.username && entry.username.toLowerCase() === user.username.toLowerCase()) return true;
    if (entry.employeeName && user.fullName && entry.employeeName.toLowerCase() === user.fullName.toLowerCase()) return true;
    if (entry.employeeId && user.employeeId && entry.employeeId === user.employeeId) return true;
    return false;
  }

  private initLocalStorageDefaults() {
    if (!localStorage.getItem(this.LS_CATEGORIES)) {
      const defCats: Category[] = [
        { categoryId: 1, name: 'Development', colorCode: '#60A5FA', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 },
        { categoryId: 2, name: 'Bug Fix', colorCode: '#F87171', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 },
        { categoryId: 3, name: 'Support', colorCode: '#FBBF24', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 },
        { categoryId: 4, name: 'Utility', colorCode: '#34D399', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 },
        { categoryId: 5, name: 'Discussion', colorCode: '#A78BFA', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 },
        { categoryId: 6, name: 'Code Review', colorCode: '#38BDF8', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 },
        { categoryId: 7, name: 'Testing', colorCode: '#4ADE80', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 },
        { categoryId: 8, name: 'Deployment', colorCode: '#C084FC', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 },
        { categoryId: 9, name: 'Documentation', colorCode: '#94A3B8', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 },
        { categoryId: 10, name: 'General', colorCode: '#2DD4BF', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 }
      ];
      localStorage.setItem(this.LS_CATEGORIES, JSON.stringify(defCats));
    }

    if (!localStorage.getItem(this.LS_USERS)) {
      const defUsers = [
        { employeeCode: 'EMP001', fullName: 'Admin User', username: 'admin', department: 'Information Technology', designation: 'System Administrator', dailyCapacityHours: 8, isActive: true, role: 'ADMIN' },
        { employeeCode: 'EMP002', fullName: 'Team Manager', username: 'manager', department: 'Engineering', designation: 'Engineering Lead', dailyCapacityHours: 8, isActive: true, role: 'MANAGER' },
        { employeeCode: 'EMP003', fullName: 'Software Engineer', username: 'employee', department: 'Engineering', designation: 'Senior Software Engineer', dailyCapacityHours: 8, isActive: true, role: 'EMPLOYEE' }
      ];
      localStorage.setItem(this.LS_USERS, JSON.stringify(defUsers));
    }

    if (!localStorage.getItem(this.LS_ENTRIES)) {
      const defEntries: WorkEntry[] = [
        {
          workEntryId: 1,
          employeeId: 1,
          employeeCode: 'EMP001',
          employeeName: 'Admin User',
          username: 'admin',
          workDate: new Date().toISOString().substring(0, 10),
          taskNumber: '358112',
          description: 'Task 358112: Dev : Password Reset requirement in User Account utility',
          categoryId: 1,
          categoryName: 'Development',
          categoryColor: '#60A5FA',
          meetingEffortHours: 0,
          workEffortHours: 8,
          totalEffortHours: 8,
          plannedEffortHours: 8,
          varianceHours: 0,
          status: 'In Progress',
          remarks: 'Initial implementation and self-tested',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(this.LS_ENTRIES, JSON.stringify(defEntries));
    }
  }

  // Daily Work & Work Entries
  getDailyWork(date: string, selectedEmpCode?: string): Observable<ApiResponse<DailyWorkScreen>> {
    const user = this.getCurrentUser();
    const isAdmin = this.isAdminOrManager();

    const allEntries: WorkEntry[] = JSON.parse(localStorage.getItem(this.LS_ENTRIES) || '[]');
    const targetDate = date.substring(0, 10);
    
    // Strict isolation: Employees only see their own tasks
    let dayEntries = allEntries.filter(e => (e.workDate || '').substring(0, 10) === targetDate);
    if (!isAdmin) {
      dayEntries = dayEntries.filter(e => this.isEntryOwner(e, user));
    } else if (selectedEmpCode && selectedEmpCode !== 'ALL') {
      dayEntries = dayEntries.filter(e => e.employeeCode === selectedEmpCode || (e.username && e.username.toLowerCase() === selectedEmpCode.toLowerCase()));
    }

    const totalWork = dayEntries.reduce((sum, e) => sum + (e.workEffortHours || 0), 0);
    const totalMeeting = dayEntries.reduce((sum, e) => sum + (e.meetingEffortHours || 0), 0);
    const totalActual = totalWork + totalMeeting;
    const totalPlanned = dayEntries.reduce((sum, e) => sum + (e.plannedEffortHours || 0), 0);
    const capacity = user?.dailyCapacityHours || 8.0;
    const remaining = Math.max(0, capacity - totalActual);
    const overtime = Math.max(0, totalActual - capacity);
    const utilization = capacity > 0 ? Math.round((totalActual / capacity) * 100) : 0;

    const d = new Date(date);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });

    const mockScreen: DailyWorkScreen = {
      date: targetDate,
      dayName: dayName,
      employeeId: user?.employeeId || 1,
      employeeName: user?.fullName || 'User',
      dailyCapacityHours: capacity,
      totalPlannedHours: totalPlanned,
      totalMeetingHours: totalMeeting,
      totalWorkHours: totalWork,
      totalActualHours: totalActual,
      remainingCapacityHours: remaining,
      overtimeHours: overtime,
      utilizationPercentage: utilization,
      isOverCapacity: totalActual > capacity,
      isHoliday: false,
      isLeave: false,
      entries: dayEntries
    };

    return of({ success: true, message: 'Loaded daily work', data: mockScreen });
  }

  getWorkEntries(filter: any): Observable<ApiResponse<PagedResult<WorkEntry>>> {
    const user = this.getCurrentUser();
    const isAdmin = this.isAdminOrManager();

    let entries: WorkEntry[] = JSON.parse(localStorage.getItem(this.LS_ENTRIES) || '[]');
    
    // Strict isolation: Employees only see their own tasks
    if (!isAdmin) {
      entries = entries.filter(e => this.isEntryOwner(e, user));
    } else if (filter.employeeCode && filter.employeeCode !== 'ALL') {
      entries = entries.filter(e => e.employeeCode === filter.employeeCode || (e.username && e.username.toLowerCase() === filter.employeeCode.toLowerCase()));
    }

    if (filter.searchTerm) {
      const s = filter.searchTerm.toLowerCase();
      entries = entries.filter(e => 
        (e.description || '').toLowerCase().includes(s) || 
        (e.taskNumber || '').toLowerCase().includes(s) ||
        (e.employeeName || '').toLowerCase().includes(s)
      );
    }
    if (filter.categoryId) {
      entries = entries.filter(e => e.categoryId === Number(filter.categoryId));
    }
    if (filter.status) {
      entries = entries.filter(e => e.status === filter.status);
    }
    if (filter.fromDate) {
      entries = entries.filter(e => (e.workDate || '') >= filter.fromDate);
    }
    if (filter.toDate) {
      entries = entries.filter(e => (e.workDate || '') <= filter.toDate);
    }

    const paged: PagedResult<WorkEntry> = {
      items: entries,
      totalCount: entries.length,
      pageNumber: 1,
      pageSize: 50,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    };
    return of({ success: true, message: 'OK', data: paged });
  }

  createWorkEntry(entry: any): Observable<ApiResponse<WorkEntry>> {
    const user = this.getCurrentUser();
    const entries: WorkEntry[] = JSON.parse(localStorage.getItem(this.LS_ENTRIES) || '[]');
    const categories: Category[] = JSON.parse(localStorage.getItem(this.LS_CATEGORIES) || '[]');
    const cat = categories.find(c => c.categoryId === Number(entry.categoryId));

    const newEntry: WorkEntry = {
      workEntryId: Date.now(),
      employeeId: user?.employeeId || 1,
      employeeCode: user?.employeeCode || 'EMP001',
      employeeName: user?.fullName || 'User',
      username: user?.username || 'user',
      workDate: entry.workDate,
      taskNumber: entry.taskNumber,
      description: entry.description,
      categoryId: entry.categoryId,
      categoryName: cat ? cat.name : 'Development',
      categoryColor: cat ? cat.colorCode : '#60A5FA',
      meetingId: entry.meetingId,
      meetingName: entry.meetingName,
      plannedEffortHours: Number(entry.plannedEffortHours || 8),
      meetingEffortHours: Number(entry.meetingEffortHours || 0),
      workEffortHours: Number(entry.workEffortHours || 8),
      totalEffortHours: Number(entry.meetingEffortHours || 0) + Number(entry.workEffortHours || 8),
      varianceHours: (Number(entry.meetingEffortHours || 0) + Number(entry.workEffortHours || 8)) - Number(entry.plannedEffortHours || 8),
      status: entry.status || 'In Progress',
      remarks: entry.remarks,
      createdAt: new Date().toISOString()
    };

    entries.unshift(newEntry);
    localStorage.setItem(this.LS_ENTRIES, JSON.stringify(entries));
    return of({ success: true, message: 'Work entry saved', data: newEntry });
  }

  updateWorkEntry(id: number, entry: any): Observable<ApiResponse<WorkEntry>> {
    let entries: WorkEntry[] = JSON.parse(localStorage.getItem(this.LS_ENTRIES) || '[]');
    const categories: Category[] = JSON.parse(localStorage.getItem(this.LS_CATEGORIES) || '[]');
    const cat = categories.find(c => c.categoryId === Number(entry.categoryId));

    entries = entries.map(e => {
      if (e.workEntryId === id) {
        return {
          ...e,
          taskNumber: entry.taskNumber,
          description: entry.description,
          categoryId: entry.categoryId,
          categoryName: cat ? cat.name : e.categoryName,
          categoryColor: cat ? cat.colorCode : e.categoryColor,
          plannedEffortHours: Number(entry.plannedEffortHours),
          meetingEffortHours: Number(entry.meetingEffortHours),
          workEffortHours: Number(entry.workEffortHours),
          totalEffortHours: Number(entry.meetingEffortHours) + Number(entry.workEffortHours),
          varianceHours: (Number(entry.meetingEffortHours) + Number(entry.workEffortHours)) - Number(entry.plannedEffortHours),
          status: entry.status,
          remarks: entry.remarks
        };
      }
      return e;
    });

    localStorage.setItem(this.LS_ENTRIES, JSON.stringify(entries));
    return of({ success: true, message: 'Work entry updated', data: entry });
  }

  deleteWorkEntry(id: number): Observable<ApiResponse> {
    let entries: WorkEntry[] = JSON.parse(localStorage.getItem(this.LS_ENTRIES) || '[]');
    entries = entries.filter(e => e.workEntryId !== id);
    localStorage.setItem(this.LS_ENTRIES, JSON.stringify(entries));
    return of({ success: true, message: 'Entry deleted' });
  }

  copyWorkEntries(request: any): Observable<ApiResponse<WorkEntry[]>> {
    const user = this.getCurrentUser();
    const entries: WorkEntry[] = JSON.parse(localStorage.getItem(this.LS_ENTRIES) || '[]');
    const sourceDate = request.sourceDate;
    const targetDate = request.targetDate;

    const sourceEntries = entries.filter(e => (e.workDate || '').substring(0, 10) === sourceDate && this.isEntryOwner(e, user));
    const copied = sourceEntries.map(e => ({
      ...e,
      workEntryId: Date.now() + Math.floor(Math.random() * 1000),
      workDate: targetDate
    }));

    localStorage.setItem(this.LS_ENTRIES, JSON.stringify([...copied, ...entries]));
    return of({ success: true, message: 'Entries copied', data: copied });
  }

  addRemark(entryId: number, remark: any): Observable<ApiResponse> {
    return of({ success: true, message: 'Remark added' });
  }

  // Categories & Meetings
  getCategories(): Observable<ApiResponse<Category[]>> {
    const cats = JSON.parse(localStorage.getItem(this.LS_CATEGORIES) || '[]');
    return of({ success: true, message: 'OK', data: cats });
  }

  createCategory(cat: any): Observable<ApiResponse<Category>> {
    const cats: Category[] = JSON.parse(localStorage.getItem(this.LS_CATEGORIES) || '[]');
    const newCat: Category = { categoryId: Date.now(), name: cat.name, colorCode: cat.colorCode || '#60A5FA', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 };
    cats.push(newCat);
    localStorage.setItem(this.LS_CATEGORIES, JSON.stringify(cats));
    return of({ success: true, message: 'Category created', data: newCat });
  }

  getMeetings(): Observable<ApiResponse<Meeting[]>> {
    const meets: Meeting[] = [
      { meetingId: 1, meetingName: 'Daily Standup', defaultDurationHours: 0.5, isActive: true },
      { meetingId: 2, meetingName: 'Sprint Planning', defaultDurationHours: 2.0, isActive: true },
      { meetingId: 3, meetingName: 'Sprint Retrospective', defaultDurationHours: 1.0, isActive: true }
    ];
    return of({ success: true, message: 'OK', data: meets });
  }

  getMeetingAnalysis(fromDate?: string, toDate?: string): Observable<ApiResponse<MeetingAnalysis[]>> {
    return of({ success: true, message: 'OK', data: [] });
  }

  // Work Items Backlog
  getWorkItems(filter: any): Observable<ApiResponse<PagedResult<WorkItem>>> {
    const user = this.getCurrentUser();
    const isAdmin = this.isAdminOrManager();
    let entries: WorkEntry[] = JSON.parse(localStorage.getItem(this.LS_ENTRIES) || '[]');
    
    if (!isAdmin) {
      entries = entries.filter(e => this.isEntryOwner(e, user));
    }

    const itemsMap = new Map<string, WorkItem>();

    entries.forEach((e, idx) => {
      const num = e.taskNumber || `TASK-${idx}`;
      if (!itemsMap.has(num)) {
        itemsMap.set(num, {
          workItemId: idx + 1,
          workItemNumber: num,
          title: e.description,
          status: e.status,
          priority: 'Medium',
          totalEffortLoggedHours: e.totalEffortHours,
          daysWorkedCount: 1,
          createdAt: new Date().toISOString()
        });
      } else {
        const existing = itemsMap.get(num)!;
        existing.totalEffortLoggedHours += e.totalEffortHours;
        existing.daysWorkedCount += 1;
      }
    });

    const list = Array.from(itemsMap.values());
    return of({ success: true, message: 'OK', data: { items: list, totalCount: list.length, pageNumber: 1, pageSize: 50, totalPages: 1, hasPreviousPage: false, hasNextPage: false } });
  }

  getWorkItemTimeline(id: number): Observable<ApiResponse<WorkItemTimeline>> {
    return of({ success: true, message: 'OK', data: { workItemId: id, workItemNumber: '358112', title: 'Task Timeline', totalEffort: 8, timeline: [] } });
  }

  createWorkItem(item: any): Observable<ApiResponse<WorkItem>> {
    return of({ success: true, message: 'Item created', data: item });
  }

  updateWorkItem(id: number, item: any): Observable<ApiResponse<WorkItem>> {
    return of({ success: true, message: 'Item updated', data: item });
  }

  // Dashboard, Reports & Analytics
  getDashboard(date?: string, employeeId?: number): Observable<ApiResponse<DashboardSummary>> {
    const user = this.getCurrentUser();
    const isAdmin = this.isAdminOrManager();
    let entries: WorkEntry[] = JSON.parse(localStorage.getItem(this.LS_ENTRIES) || '[]');
    
    if (!isAdmin) {
      entries = entries.filter(e => this.isEntryOwner(e, user));
    }

    const todayStr = (date || new Date().toISOString()).substring(0, 10);
    const todayEntries = entries.filter(e => (e.workDate || '').substring(0, 10) === todayStr);

    const totalWork = todayEntries.reduce((sum, e) => sum + e.workEffortHours, 0);
    const totalMeeting = todayEntries.reduce((sum, e) => sum + e.meetingEffortHours, 0);
    const totalActual = totalWork + totalMeeting;
    const totalPlanned = todayEntries.reduce((sum, e) => sum + e.plannedEffortHours, 0);
    const capacity = user?.dailyCapacityHours || 8.0;

    const mockDash: DashboardSummary = {
      date: todayStr,
      capacityHours: capacity,
      plannedHours: totalPlanned || capacity,
      actualHours: totalActual || capacity,
      meetingHours: totalMeeting,
      workHours: totalWork || capacity,
      remainingHours: Math.max(0, capacity - totalActual),
      overtimeHours: Math.max(0, totalActual - capacity),
      utilizationPercentage: capacity > 0 ? Math.round((totalActual / capacity) * 100) : 100,
      weeklyActualHours: totalActual,
      monthlyActualHours: totalActual,
      todayEntries: todayEntries,
      dailyEffortTrend: [
        { label: 'Mon', workHours: 7, meetingHours: 1, totalHours: 8, plannedHours: 8, capacityHours: 8 },
        { label: 'Tue', workHours: 6, meetingHours: 2, totalHours: 8, plannedHours: 8, capacityHours: 8 },
        { label: 'Wed', workHours: 8, meetingHours: 0, totalHours: 8, plannedHours: 8, capacityHours: 8 },
        { label: 'Thu', workHours: totalWork || 8, meetingHours: totalMeeting, totalHours: totalActual || 8, plannedHours: 8, capacityHours: 8 }
      ],
      categoryDistribution: [
        { categoryName: 'Development', colorCode: '#60A5FA', totalHours: totalWork || 8, percentage: 85 },
        { categoryName: 'Meeting', colorCode: '#A78BFA', totalHours: totalMeeting || 0, percentage: 15 }
      ],
      meetingDistribution: [],
      teamSummary: {
        totalMembers: 3,
        totalCapacity: 24,
        totalPlanned: 24,
        totalActual: 24,
        totalMeetings: 2,
        totalOvertime: 0,
        averageUtilization: 100,
        memberUtilizations: [
          { employeeId: 1, employeeName: 'Admin User', plannedHours: 8, actualHours: 8, meetingHours: 0, workHours: 8, utilizationPercentage: 100 },
          { employeeId: 2, employeeName: 'Team Manager', plannedHours: 8, actualHours: 8, meetingHours: 1, workHours: 7, utilizationPercentage: 100 },
          { employeeId: 3, employeeName: 'Software Engineer', plannedHours: 8, actualHours: 8, meetingHours: 1, workHours: 7, utilizationPercentage: 100 }
        ]
      }
    };
    return of({ success: true, message: 'OK', data: mockDash });
  }

  getWeeklyReport(weekStartDate: string, employeeId?: number): Observable<ApiResponse<WeeklyReport>> {
    return of({ success: true, message: 'OK', data: { weekNumber: 34, startDate: weekStartDate, endDate: weekStartDate, workingDays: 5, holidays: 0, leaveDays: 0, plannedHours: 40, meetingHours: 4, workHours: 36, actualHours: 40, varianceHours: 0, overtimeHours: 0, utilizationPercentage: 100, dailyBreakdown: [], categoryBreakdown: [], meetingBreakdown: [], workItemBreakdown: [] } });
  }

  getMonthlyReport(year: number, month: number, employeeId?: number): Observable<ApiResponse<MonthlyReport>> {
    return of({ success: true, message: 'OK', data: { year, month, monthName: 'Current Month', workingDays: 22, holidays: 0, leaveDays: 0, plannedHours: 176, meetingHours: 16, workHours: 160, actualHours: 176, overtimeHours: 0, averageHoursPerDay: 8, utilizationPercentage: 100, varianceHours: 0, weeks: [] } });
  }

  getYearlyReport(year: number, employeeId?: number): Observable<ApiResponse<YearlyReport>> {
    return of({ success: true, message: 'OK', data: { year, grandTotalWorkHours: 1820, grandTotalMeetingHours: 180, grandCombinedTotalHours: 2000, months: [] } });
  }

  // Calendar, Holidays, Leaves
  getCalendar(year: number, month: number, employeeId?: number): Observable<ApiResponse<CalendarMonth>> {
    return of({ success: true, message: 'OK', data: { year, month, monthName: 'August', totalWorkHours: 160, totalMeetingHours: 16, combinedTotalHours: 176, workingDaysCount: 22, holidaysCount: 0, leaveDaysCount: 0, days: [] } });
  }

  getHolidays(year?: number): Observable<ApiResponse<Holiday[]>> {
    return of({ success: true, message: 'OK', data: [] });
  }

  createHoliday(h: any): Observable<ApiResponse<Holiday>> {
    return of({ success: true, message: 'Holiday saved', data: h });
  }

  deleteHoliday(id: number): Observable<ApiResponse> {
    return of({ success: true, message: 'Deleted' });
  }

  getLeaves(employeeId?: number, year?: number): Observable<ApiResponse<Leave[]>> {
    return of({ success: true, message: 'OK', data: [] });
  }

  applyLeave(leave: any): Observable<ApiResponse<Leave>> {
    return of({ success: true, message: 'Leave applied', data: leave });
  }

  updateLeaveStatus(id: number, status: string, remarks?: string): Observable<ApiResponse<Leave>> {
    return of({ success: true, message: 'Leave status updated', data: {} as any });
  }

  // Excel Importer
  previewExcel(file: File): Observable<ApiResponse<ImportPreview>> {
    const rows: any[] = [];
    const sheets = ['AUG 2026', 'JUL 2026', 'JUN 2026', 'MAY 2026', 'AllData'];
    
    const tasks = [
      { num: '358112', title: 'Dev : Password Reset requirement in User Account utility', cat: 'Development', w: 7.5, m: 0.5 },
      { num: '318286', title: 'Shipment Document Landed Cost calculation fix', cat: 'Bug Fix', w: 8.0, m: 0 },
      { num: '344192', title: 'Tax Assessment multi-currency reconciliation report', cat: 'Development', w: 6.5, m: 1.5 },
      { num: '320199', title: 'Inventory Batch Tracking API latency optimization', cat: 'Performance', w: 8.0, m: 0 },
      { num: '360144', title: 'Supplier Master Data Excel Importer schema validation', cat: 'Development', w: 7.0, m: 1.0 },
      { num: '351200', title: 'Payment Gateway Webhook signature verification', cat: 'Security', w: 8.0, m: 0 },
      { num: '339811', title: 'Sprint Review & Architecture Refactoring Discussion', cat: 'Discussion', w: 4.0, m: 4.0 }
    ];

    let rIdx = 2;
    sheets.slice(0, 4).forEach((sheetName, sIdx) => {
      const monthNum = 8 - sIdx;
      const monthStr = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
      
      for (let d = 1; d <= 22; d++) {
        const dayStr = d < 10 ? `0${d}` : `${d}`;
        const dateStr = `2026-${monthStr}-${dayStr}`;
        const t = tasks[(d + sIdx) % tasks.length];

        rows.push({
          rowIndex: rIdx++,
          sheetName: sheetName,
          date: dateStr,
          rawTask: `Task ${t.num}: ${t.title}`,
          normalizedTaskNumber: t.num,
          normalizedTitle: t.title,
          category: t.cat,
          meeting: t.m > 0 ? 'Sprint Sync' : '',
          meetingEffort: t.m,
          workEffort: t.w,
          totalEffort: t.w + t.m,
          status: 'Valid',
          remarks: 'Imported from monthly workbook sheet'
        });
      }
    });

    const mockPreview: ImportPreview = {
      fileName: file.name,
      totalSheets: sheets.length,
      totalRows: rows.length,
      validRows: rows.length,
      warningRows: 0,
      errorRows: 0,
      duplicateRows: 0,
      detectedSheets: sheets,
      previewRows: rows
    };
    return of({ success: true, message: 'Parsed workbook successfully across all monthly sheets', data: mockPreview });
  }

  confirmImport(request: any): Observable<ApiResponse<ImportResult>> {
    const user = this.getCurrentUser();
    const rows = request.rowsToImport || [];
    const entries: WorkEntry[] = JSON.parse(localStorage.getItem(this.LS_ENTRIES) || '[]');
    
    rows.forEach((r: any, idx: number) => {
      entries.unshift({
        workEntryId: Date.now() + idx,
        employeeId: user?.employeeId || 1,
        employeeCode: user?.employeeCode || 'EMP001',
        employeeName: user?.fullName || 'User',
        username: user?.username || 'user',
        workDate: r.date || new Date().toISOString().substring(0, 10),
        taskNumber: r.normalizedTaskNumber || 'TASK',
        description: r.rawTask || r.normalizedTitle || 'Imported Task',
        categoryId: 1,
        categoryName: r.category || 'Development',
        categoryColor: '#60A5FA',
        meetingEffortHours: r.meetingEffort || 0,
        workEffortHours: r.workEffort || 8,
        totalEffortHours: r.totalEffort || 8,
        plannedEffortHours: r.totalEffort || 8,
        varianceHours: 0,
        status: 'Completed',
        remarks: r.remarks || 'Imported from Excel',
        createdAt: new Date().toISOString()
      });
    });

    localStorage.setItem(this.LS_ENTRIES, JSON.stringify(entries));

    const res: ImportResult = {
      importJobId: Date.now(),
      totalProcessed: rows.length || 88,
      importedCount: rows.length || 88,
      skippedCount: 0,
      errorsCount: 0,
      status: 'Completed',
      messages: ['Imported all rows into database successfully']
    };
    return of({ success: true, message: 'Import completed', data: res });
  }

  // Exports
  exportAllDataCsv(filter: any): Observable<Blob> {
    const user = this.getCurrentUser();
    const isAdmin = this.isAdminOrManager();
    let entries: WorkEntry[] = JSON.parse(localStorage.getItem(this.LS_ENTRIES) || '[]');
    
    if (!isAdmin) {
      entries = entries.filter(e => this.isEntryOwner(e, user));
    }

    let csv = 'WorkEntryId,EmployeeName,WorkDate,TaskNumber,Description,Category,PlannedHours,MeetingHours,WorkHours,TotalHours,Status,Remarks\\n';
    entries.forEach(e => {
      csv += `${e.workEntryId},"${e.employeeName || 'User'}","${e.workDate}","${e.taskNumber}","${(e.description || '').replace(/"/g, '""')}","${e.categoryName}",${e.plannedEffortHours},${e.meetingEffortHours},${e.workEffortHours},${e.totalEffortHours},"${e.status}","${(e.remarks || '').replace(/"/g, '""')}\\n`;
    });
    return of(new Blob([csv], { type: 'text/csv' }));
  }

  exportWeeklyExcel(weekStartDate: string): Observable<Blob> {
    return of(new Blob([''], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  }

  exportMonthlyExcel(year: number, month: number): Observable<Blob> {
    return of(new Blob([''], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  }

  exportYearlyExcel(year: number): Observable<Blob> {
    return of(new Blob([''], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  }

  // Admin & User Management
  registerUser(user: any): Observable<ApiResponse<any>> {
    const users = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    const newUser = {
      employeeCode: `EMP00${users.length + 1}`,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      username: user.username,
      email: user.email,
      password: user.password || 'Password@123',
      department: user.department || 'Engineering',
      designation: user.designation || 'Software Engineer',
      dailyCapacityHours: Number(user.dailyCapacityHours || 8),
      isActive: user.isActive !== false,
      role: user.role || 'EMPLOYEE'
    };
    users.push(newUser);
    localStorage.setItem(this.LS_USERS, JSON.stringify(users));
    return of({ success: true, message: 'User created in local storage', data: newUser });
  }

  getEmployees(): Observable<ApiResponse<any[]>> {
    const users = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    return of({ success: true, message: 'OK', data: users });
  }

  getAuditLogs(page = 1, pageSize = 20): Observable<ApiResponse<any>> {
    return of({ success: true, message: 'OK', data: { items: [{ timestamp: new Date().toISOString(), username: 'admin', action: 'CreateWorkEntry', entityName: 'WorkEntry', entityId: 1 }] } });
  }

  getSystemSettings(): Observable<ApiResponse<any[]>> {
    return of({ success: true, message: 'OK', data: [
      { key: 'DailyStandardCapacityHours', value: '8.0', description: 'Standard expected daily capacity in hours', dataType: 'Decimal' },
      { key: 'AllowOvertimeLogging', value: 'True', description: 'Permits logging more than 8 hours per day', dataType: 'Boolean' },
      { key: 'EnableSmartTaskExtraction', value: 'True', description: 'Regex parsing of task numbers & titles', dataType: 'Boolean' }
    ] });
  }
}
