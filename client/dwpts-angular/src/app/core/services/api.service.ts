import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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
    if (!u) return false;
    const roles = (u.roles || []).map(r => String(r).toUpperCase());
    const username = String(u.username || '').toLowerCase();
    return roles.includes('ADMIN') || roles.includes('MANAGER') || username === 'admin';
  }

  private isEntryOwner(entry: WorkEntry, user: UserProfile | null): boolean {
    if (!user) return false;
    const targetUser = (user.username || '').toLowerCase();
    const targetFullName = (user.fullName || '').toLowerCase();
    const targetCode = (user.employeeCode || '').toLowerCase();

    // 1. Organization baseline historical import data is accessible to all team members
    if (entry.isOrgBaseline || (entry.username && entry.username.toLowerCase() === 'all') || (entry.employeeCode && (entry.employeeCode.toLowerCase() === 'all' || entry.employeeCode.toLowerCase() === 'org_baseline'))) return true;

    // 2. Unassigned baseline tasks
    if (!entry.username && !entry.employeeCode) return true;

    // 3. Match by username
    if (entry.username && (entry.username.toLowerCase() === targetUser || targetUser.includes(entry.username.toLowerCase()) || entry.username.toLowerCase().includes(targetUser))) return true;

    // 4. Match by full name
    if (entry.employeeName && (entry.employeeName.toLowerCase() === targetFullName || targetFullName.includes(entry.employeeName.toLowerCase()) || entry.employeeName.toLowerCase().includes(targetFullName))) return true;

    // 5. Match by employee code
    if (entry.employeeCode && (entry.employeeCode.toLowerCase() === targetCode || targetCode.includes(entry.employeeCode.toLowerCase()) || entry.employeeCode.toLowerCase().includes(targetCode))) return true;

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

    if (!localStorage.getItem(this.LS_ENTRIES)) {
      localStorage.setItem(this.LS_ENTRIES, JSON.stringify([]));
    }
  }

  // Clear all old records & reset to clean slate
  clearAllRecords(): void {
    localStorage.setItem(this.LS_ENTRIES, JSON.stringify([]));
    localStorage.setItem(this.LS_USERS, JSON.stringify([]));
    localStorage.setItem(this.LS_MEETINGS, JSON.stringify([]));
  }


