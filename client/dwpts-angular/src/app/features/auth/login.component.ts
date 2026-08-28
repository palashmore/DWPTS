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
            <input type="text" [(ngModel)]="username" name="username" placeholder="Username or Email (e.g. admin)" required />
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="Enter your password" required />
          </div>

          <button type="submit" class="btn btn-primary btn-block cta-glow" [disabled]="isLoading">
            {{ isLoading ? 'Authenticating...' : 'Sign In to Workspace ➔' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 50% 50%, #0B1728 0%, #07111F 100%);
      padding: 24px;
      position: relative;
      overflow: hidden;
      font-family: var(--font-sans);
    }

    .glow-orb {
      position: absolute;
      width: 450px;
      height: 450px;
      border-radius: 50%;
      filter: blur(140px);
      opacity: 0.15;
      pointer-events: none;
    }
    .glow-orb.top-left { top: -100px; left: -100px; background: #D6B36A; }
    .glow-orb.bottom-right { bottom: -100px; right: -100px; background: #38BDF8; }

    .login-card-glass {
      width: 100%;
      max-width: 440px;
      background: rgba(16, 30, 51, 0.85);
      backdrop-filter: blur(25px);
      border: 1px solid var(--border-gold);
      border-radius: var(--radius-xl);
      padding: 44px 38px;
      box-shadow: var(--shadow-modal);
      position: relative;
      z-index: 10;
    }

    .brand-badge-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 6px;
      h2 {
        font-size: 28px;
        font-weight: 800;
        color: #F8FAFC;
        letter-spacing: -0.02em;
      }
    }
    .brand-logo-spark {
      width: 40px;
      height: 40px;
      background: var(--gold-gradient);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #07111F;
      box-shadow: var(--gold-glow);
    }

    .brand-tagline {
      text-align: center;
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 28px;
      font-weight: 500;
    }

    .error-toast {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--status-critical-bg);
      border: 1px solid var(--status-critical-border);
      color: var(--status-critical-text);
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 12.5px;
      font-weight: 600;
      margin-bottom: 18px;
    }

    .login-form-body .form-group {
      margin-bottom: 20px;
    }

    .btn-block {
      width: 100%;
      padding: 13px;
      font-size: 14.5px;
      border-radius: var(--radius-md);
      margin-top: 10px;
    }
    .cta-glow { box-shadow: var(--gold-glow); }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.auth.login({ usernameOrEmail: this.username, password: this.password }).subscribe({
      next: res => {
        this.isLoading = false;
        if (res.success) {
          this.router.navigate(['/daily-work']);
        } else {
          this.errorMessage = res.message || 'Invalid username or password';
        }
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid username or password';
      }
    });
  }
}
