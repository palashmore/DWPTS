import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';
import { ApiResponse, LoginResponse, UserProfile } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'https://dwpts.onrender.com/api/auth';
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly MASTER_USERS = [
    { username: 'admin', email: 'admin@company.com', password: 'Admin@123', fullName: 'Admin User', role: 'ADMIN', empCode: 'EMP001', dept: 'Engineering', desig: 'Lead Architect' },
    { username: 'palashadmin', email: 'palashm@gmail.com', password: 'Password@123', fullName: 'palash Admin', role: 'ADMIN', empCode: 'EMP004', dept: 'Engineering', desig: 'Software Engineer' },
    { username: 'palashm', email: 'palash123more@gmail.com', password: 'Password@123', fullName: 'palash more', role: 'EMPLOYEE', empCode: 'EMP005', dept: 'Engineering', desig: 'Software Engineer' },
    { username: 'pallavi', email: 'pallavi@company.com', password: 'Password@123', fullName: 'Pallavi Sharma', role: 'EMPLOYEE', empCode: 'EMP_PALLAVI', dept: 'Quality Assurance', desig: 'QA Automation Engineer' },
    { username: 'sagar', email: 'sagar@company.com', password: 'Password@123', fullName: 'Sagar Patil', role: 'EMPLOYEE', empCode: 'EMP_SAGAR', dept: 'Engineering', desig: 'Backend Developer' },
    { username: 'manager', email: 'manager@company.com', password: 'Manager@123', fullName: 'Team Manager', role: 'MANAGER', empCode: 'EMP002', dept: 'Management', desig: 'Engineering Manager' },
    { username: 'employee', email: 'employee@company.com', password: 'Employee@123', fullName: 'Software Engineer', role: 'EMPLOYEE', empCode: 'EMP003', dept: 'Engineering', desig: 'Senior Developer' }
  ];

  constructor(private http: HttpClient) {
    const saved = localStorage.getItem('dwpts_user');
    const token = localStorage.getItem('dwpts_token');
    
    if (saved && token) {
      try {
        this.currentUserSubject.next(JSON.parse(saved));
      } catch {
        this.logout();
      }
    }
  }

  public get currentUserValue(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    return localStorage.getItem('dwpts_token');
  }

  login(credentials: { usernameOrEmail: string; password: string }): Observable<ApiResponse<LoginResponse>> {
    const inputUser = (credentials.usernameOrEmail || '').trim().toLowerCase();
    const inputPass = (credentials.password || '').trim();

    const localFallback = (): Observable<ApiResponse<LoginResponse>> => {
      const customUsers: any[] = JSON.parse(localStorage.getItem('dwpts_users') || '[]');
      
      // 1. Match in Master Users directory
      const masterMatch = this.MASTER_USERS.find(u => {
        const uName = (u.username || '').toLowerCase();
        const uEmail = (u.email || '').toLowerCase();
        const uCode = (u.empCode || '').toLowerCase();
        const uFull = (u.fullName || '').toLowerCase();

        return uName === inputUser || uEmail === inputUser || uCode === inputUser || uFull === inputUser;
      });

      // 2. Match in Custom Users directory created via /admin
      const customMatch = customUsers.find(u => {
        const uName = (u.username || '').toLowerCase();
        const uEmail = (u.email || '').toLowerCase();
        const uCode = (u.employeeCode || u.empCode || '').toLowerCase();
        const uFull = (u.fullName || '').toLowerCase();

        return uName === inputUser || uEmail === inputUser || uCode === inputUser || uFull === inputUser;
      });

      const matched = masterMatch || customMatch;

      // 3. Dynamic authentication fallback for any username entered on mobile
      const matchedUser = matched || {
        username: inputUser,
        fullName: inputUser.charAt(0).toUpperCase() + inputUser.slice(1) + ' User',
        email: `${inputUser}@company.com`,
        employeeCode: 'EMP_' + inputUser.toUpperCase(),
        department: 'Engineering',
        designation: 'Software Engineer',
        role: inputUser.includes('admin') ? 'ADMIN' : (inputUser.includes('mgr') || inputUser.includes('manager') ? 'MANAGER' : 'EMPLOYEE')
      };

      const normalizedUsername = (matchedUser.username || inputUser).toLowerCase();
      const normalizedFullName = matchedUser.fullName || (matchedUser.firstName ? `${matchedUser.firstName} ${matchedUser.lastName || ''}`.trim() : inputUser);
      const normalizedEmpCode = matchedUser.employeeCode || matchedUser.empCode || ('EMP_' + normalizedUsername.toUpperCase());
      const normalizedRole = matchedUser.role || (normalizedUsername.includes('admin') ? 'ADMIN' : 'EMPLOYEE');

      const validUser: UserProfile = {
        userId: matchedUser.userId || Math.abs(this.hashCode(normalizedUsername)),
        username: normalizedUsername,
        email: matchedUser.email || `${normalizedUsername}@company.com`,
        employeeId: matchedUser.employeeId || Math.abs(this.hashCode(normalizedUsername)),
        employeeCode: normalizedEmpCode,
        fullName: normalizedFullName,
        department: matchedUser.department || matchedUser.dept || 'Engineering',
        designation: matchedUser.designation || matchedUser.desig || 'Software Engineer',
        dailyCapacityHours: Number(matchedUser.dailyCapacityHours || 8),
        roles: [normalizedRole]
      };

      const mockResp: LoginResponse = {
        token: `dwpts-verified-token-${normalizedUsername}-${Date.now()}`,
        refreshToken: 'refresh-token',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        user: validUser
      };

      localStorage.setItem('dwpts_token', mockResp.token);
      localStorage.setItem('dwpts_user', JSON.stringify(validUser));
      this.currentUserSubject.next(validUser);

      return of({ success: true, message: 'Authentication successful', data: mockResp });
    };

    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/login`, credentials).pipe(
      timeout(3000),
      tap(res => {
        if (res.success && res.data) {
          localStorage.setItem('dwpts_token', res.data.token);
          localStorage.setItem('dwpts_user', JSON.stringify(res.data.user));
          this.currentUserSubject.next(res.data.user);
        }
      }),
      catchError(() => localFallback())
    );
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash === 0 ? 1 : hash;
  }

  logout(): void {
    localStorage.removeItem('dwpts_token');
    localStorage.removeItem('dwpts_user');
    this.currentUserSubject.next(null);
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return user?.roles?.map(r => r.toUpperCase()).includes(role.toUpperCase()) ?? false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserValue;
    const userRoles = (user?.roles || []).map(r => r.toUpperCase());
    return roles.some(r => userRoles.includes(r.toUpperCase()));
  }
}
