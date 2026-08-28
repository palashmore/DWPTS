import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="glow-orb top-left"></div>
      <div class="glow-orb bottom-right"></div>

      <div class="login-card-glass">
        <div class="brand-badge-header">
          <div class="brand-logo-spark">⚡</div>
          <h2>DWPTS</h2>
        </div>
        <p class="brand-tagline">Daily Work Planning & Capacity Tracking System</p>

        <div class="error-toast" *ngIf="errorMessage">
          <span>⚠️</span>
          <span>{{ errorMessage }}</span>
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form-body">
          <div class="form-group">
            <label>Username / Corporate Email</label>
            <input type="text" [(ngModel)]="username" name="username" placeholder="admin, manager or employee" required />
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required />
          </div>

          <button type="submit" class="btn btn-primary btn-block cta-glow" [disabled]="isLoading">
            {{ isLoading ? 'Authenticating...' : 'Sign In to Workspace ➔' }}
          </button>
        </form>

        <div class="quick-demo-section">
          <span class="demo-title">One-Click Quick Login:</span>
          <div class="demo-pills">
            <button type="button" class="demo-pill admin" (click)="setDemo('admin', 'Admin@123')">
              <span class="pill-dot"></span> Admin
            </button>
            <button type="button" class="demo-pill manager" (click)="setDemo('manager', 'Manager@123')">
              <span class="pill-dot"></span> Manager
            </button>
            <button type="button" class="demo-pill employee" (click)="setDemo('employee', 'Employee@123')">
              <span class="pill-dot"></span> Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%);
      padding: 24px;
      position: relative;
      overflow: hidden;
      font-family: var(--font-sans);
    }

    .glow-orb {
      position: absolute;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      filter: blur(120px);
      opacity: 0.25;
      pointer-events: none;
    }
    .glow-orb.top-left { top: -100px; left: -100px; background: #6366f1; }
    .glow-orb.bottom-right { bottom: -100px; right: -100px; background: #3b82f6; }

    .login-card-glass {
      width: 100%;
      max-width: 440px;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 40px 36px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
      position: relative;
      z-index: 10;
    }

    .brand-badge-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 6px;
    }
    .brand-logo-spark {
      width: 36px;
      height: 36px;
      background: var(--brand-gradient);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: #fff;
      box-shadow: 0 0 15px rgba(79, 70, 229, 0.5);
    }
    .brand-badge-header h2 {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
    }

    .brand-tagline {
      text-align: center;
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 28px;
      font-weight: 500;
    }

    .error-toast {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 12.5px;
      font-weight: 600;
      margin-bottom: 18px;
    }

    .login-form-body .form-group {
      margin-bottom: 18px;
      label { color: #cbd5e1; font-size: 11.5px; }
      input {
        background: rgba(30, 41, 59, 0.7);
        border: 1.5px solid rgba(255, 255, 255, 0.1);
        color: #ffffff;
        padding: 11px 14px;
        border-radius: 10px;
        font-size: 14px;
        &:focus {
          border-color: #6366f1;
          background: rgba(30, 41, 59, 0.95);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        }
      }
    }

    .btn-block {
      width: 100%;
      padding: 12px;
      font-size: 14px;
      border-radius: 10px;
      margin-top: 10px;
    }
    .cta-glow { box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4); }

    .quick-demo-section {
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      text-align: center;
    }
    .demo-title { font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 0.06em; text-transform: uppercase; display: block; margin-bottom: 10px; }
    .demo-pills { display: flex; justify-content: center; gap: 8px; }
    .demo-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition-smooth);

      &:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
        transform: translateY(-1px);
      }
    }
    .pill-dot { width: 6px; height: 6px; border-radius: 50%; background: #38bdf8; }
    .demo-pill.admin .pill-dot { background: #818cf8; }
    .demo-pill.manager .pill-dot { background: #38bdf8; }
    .demo-pill.employee .pill-dot { background: #34d399; }
  `]
})
export class LoginComponent {
  username = 'admin';
  password = 'Admin@123';
  isLoading = false;
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  setDemo(u: string, p: string) {
    this.username = u;
    this.password = p;
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.auth.login({ usernameOrEmail: this.username, password: this.password }).subscribe({
      next: res => {
        this.isLoading = false;
        if (res.success) {
          this.router.navigate(['/daily-work']);
        } else {
          this.errorMessage = res.message || 'Login failed';
        }
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid username or password';
      }
    });
  }
}
