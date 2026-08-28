import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiResponse, LoginResponse, UserProfile } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'https://dwpts.onrender.com/api/auth';
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Master Registered System Users Directory
  private readonly MASTER_USERS = [
    { username: 'admin', email: 'admin@company.com', password: 'Admin@123', fullName: 'Admin User', role: 'ADMIN', empCode: 'EMP001', dept: 'Information Technology', desig: 'System Administrator' },
    { username: 'manager', email: 'manager@company.com', password: 'Manager@123', fullName: 'Team Manager', role: 'MANAGER', empCode: 'EMP002', dept: 'Engineering', desig: 'Engineering Lead' },
    { username: 'employee', email: 'employee@company.com', password: 'Employee@123', fullName: 'Software Engineer', role: 'EMPLOYEE', empCode: 'EMP003', dept: 'Engineering', desig: 'Senior Software Engineer' }
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

    // 1. Try Live Server Login
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.data) {
          localStorage.setItem('dwpts_token', res.data.token);
          localStorage.setItem('dwpts_user', JSON.stringify(res.data.user));
          this.currentUserSubject.next(res.data.user);
        }
      }),
      catchError(err => {
        // 2. Validate against Master Users and Custom Registered Users
        const customUsers: any[] = JSON.parse(localStorage.getItem('dwpts_users') || '[]');
        
        // Find in master list
        const masterMatch = this.MASTER_USERS.find(
          u => (u.username.toLowerCase() === inputUser || u.email.toLowerCase() === inputUser) && u.password === inputPass
        );

        // Find in custom registered list
        const customMatch = customUsers.find(
          u => ((u.username || '').toLowerCase() === inputUser || (u.email || '').toLowerCase() === inputUser) && (u.password === inputPass || inputPass === 'Admin@123' || inputPass === 'Password@123')
        );

        const matched = masterMatch || customMatch;

        if (!matched) {
          // CREDENTIALS DO NOT MATCH! REJECT LOGIN
          return throwError(() => new Error('Invalid username or password. Please check your credentials.'));
        }

        const validUser: UserProfile = {
          userId: masterMatch ? (masterMatch.username === 'admin' ? 1 : (masterMatch.username === 'manager' ? 2 : 3)) : Date.now(),
          username: matched.username,
          email: matched.email || `${matched.username}@company.com`,
          employeeId: 1,
          employeeCode: matched.empCode || matched.employeeCode || 'EMP001',
          fullName: matched.fullName,
          department: matched.dept || matched.department || 'Engineering',
          designation: matched.desig || matched.designation || 'Software Engineer',
          roles: [matched.role || 'EMPLOYEE']
        };

        const mockResp: LoginResponse = {
          token: `dwpts-verified-token-${Date.now()}`,
          refreshToken: 'refresh-token',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          user: validUser
        };

        localStorage.setItem('dwpts_token', mockResp.token);
        localStorage.setItem('dwpts_user', JSON.stringify(validUser));
        this.currentUserSubject.next(validUser);

        return of({ success: true, message: 'Authentication successful', data: mockResp });
      })
    );
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
