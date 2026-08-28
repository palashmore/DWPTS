import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-container" *ngIf="auth.currentUser$ | async as user; else unauth">
      <!-- Luxury Midnight Navy Sidebar -->
      <aside class="sidebar" [class.collapsed]="isSidebarCollapsed">
        <div class="sidebar-header">
          <div class="logo-box">
            <span class="logo-sparkle">⚡</span>
          </div>
          <div class="logo-info" *ngIf="!isSidebarCollapsed">
            <span class="brand-title">DWPTS</span>
            <span class="brand-subtitle">EXECUTIVE COMMAND</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-title" *ngIf="!isSidebarCollapsed">PLANNING</div>
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" title="Dashboard">
            <span class="nav-icon">📊</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Dashboard</span>
          </a>
          <a routerLink="/daily-work" routerLinkActive="active" class="nav-item" title="Daily Work">
            <span class="nav-icon">⚡</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Daily Work</span>
          </a>
          <a routerLink="/work-entries" routerLinkActive="active" class="nav-item" title="All Work Entries">
            <span class="nav-icon">📋</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">All Entries</span>
          </a>
          <a routerLink="/work-items" routerLinkActive="active" class="nav-item" title="Work Items Backlog">
            <span class="nav-icon">🎯</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Work Items</span>
          </a>
          <a routerLink="/calendar" routerLinkActive="active" class="nav-item" title="Monthly Calendar">
            <span class="nav-icon">📅</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Calendar</span>
          </a>
          <a routerLink="/reports" routerLinkActive="active" class="nav-item" title="Executive Reports">
            <span class="nav-icon">📑</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Reports & Matrix</span>
          </a>

          <div class="nav-section-title" *ngIf="!isSidebarCollapsed">MASTER DATA</div>
          <a routerLink="/meetings" routerLinkActive="active" class="nav-item" title="Meetings">
            <span class="nav-icon">👥</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Meetings</span>
          </a>
          <a routerLink="/categories" routerLinkActive="active" class="nav-item" title="Categories">
            <span class="nav-icon">🏷️</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Categories</span>
          </a>
          <a routerLink="/holidays" routerLinkActive="active" class="nav-item" title="Holidays">
            <span class="nav-icon">🎉</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Holidays</span>
          </a>
          <a routerLink="/leaves" routerLinkActive="active" class="nav-item" title="Leaves">
            <span class="nav-icon">🏖️</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Leaves</span>
          </a>

          <div class="nav-section-title" *ngIf="!isSidebarCollapsed">SYSTEM</div>
          <a routerLink="/import" routerLinkActive="active" class="nav-item" title="Excel Import">
            <span class="nav-icon">📥</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Excel Importer</span>
          </a>
          <a routerLink="/admin" routerLinkActive="active" class="nav-item" *ngIf="user.roles.includes('ADMIN')" title="Administration">
            <span class="nav-icon">⚙️</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Administration</span>
          </a>
        </nav>

        <div class="sidebar-footer" *ngIf="!isSidebarCollapsed">
          <div class="user-profile-pill">
            <div class="user-avatar">
              {{ user.username.substring(0, 2).toUpperCase() }}
              <span class="status-indicator-dot"></span>
            </div>
            <div class="user-details">
              <span class="user-name">{{ user.fullName || user.username }}</span>
              <span class="user-role">{{ user.roles.join(', ') }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Layout Container -->
      <div class="main-wrapper">
        <header class="top-navbar">
          <div class="left-nav-group">
            <button class="toggle-sidebar-btn" (click)="isSidebarCollapsed = !isSidebarCollapsed" title="Toggle Navigation">
              <span class="icon-bar">☰</span>
            </button>
            <div class="breadcrumb-container">
              <span class="breadcrumb-system">DWPTS Operational Suite</span>
              <span class="breadcrumb-separator">/</span>
              <span class="breadcrumb-active">Executive Workspace</span>
            </div>
          </div>

          <div class="right-nav-group">
            <div class="live-status-pill">
              <span class="live-dot"></span>
              <span>Command Center Synced</span>
            </div>
            <button class="signout-button" (click)="logout()">
              <span>Sign Out</span>
              <span class="signout-icon">🚪</span>
            </button>
          </div>
        </header>

        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>

    <ng-template #unauth>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .app-container {
      display: flex;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background: var(--bg-app);
      font-family: var(--font-sans);
    }

    /* Luxury Midnight Navy Sidebar */
    .sidebar {
      width: 260px;
      background: #07111F;
      color: #F8FAFC;
      display: flex;
      flex-direction: column;
      transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 100;
      border-right: 1px solid var(--border-subtle);
    }
    .sidebar.collapsed { width: 72px; }

    .sidebar-header {
      padding: 20px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--border-subtle);
      background: #0B1728;
    }

    .logo-box {
      width: 36px;
      height: 36px;
      background: var(--gold-gradient);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--gold-glow);
    }
    .logo-sparkle { font-size: 18px; color: #07111F; }

    .logo-info { display: flex; flex-direction: column; }
    .brand-title { font-size: 17px; font-weight: 800; color: #F8FAFC; letter-spacing: -0.02em; }
    .brand-subtitle { font-size: 9.5px; font-weight: 700; color: var(--gold-primary); letter-spacing: 0.08em; }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 16px 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-section-title {
      font-size: 10px;
      font-weight: 800;
      color: var(--text-muted);
      padding: 14px 12px 6px;
      letter-spacing: 0.08em;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 500;
      transition: var(--transition-smooth);
      position: relative;

      &:hover {
        background: var(--bg-surface-elevated);
        color: #FFFFFF;
      }

      &.active {
        background: rgba(214, 179, 106, 0.10);
        color: #FFFFFF;
        font-weight: 700;
        border: 1px solid rgba(214, 179, 106, 0.25);

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 15%;
          bottom: 15%;
          width: 3px;
          border-radius: 0 4px 4px 0;
          background: var(--gold-primary);
          box-shadow: 0 0 8px var(--gold-primary);
        }
      }
    }
    .nav-icon { font-size: 15px; }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid var(--border-subtle);
      background: #0B1728;
    }
    .user-profile-pill {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      background: var(--gold-gradient);
      color: #07111F;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 800;
      position: relative;
    }
    .status-indicator-dot {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 9px;
      height: 9px;
      background: #34D399;
      border: 2px solid #07111F;
      border-radius: 50%;
    }
    .user-details { display: flex; flex-direction: column; overflow: hidden; }
    .user-name { font-size: 13px; font-weight: 700; color: #FFFFFF; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }
    .user-role { font-size: 10.5px; color: var(--gold-highlight); font-weight: 700; text-transform: uppercase; }

    /* Top Navbar */
    .main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .top-navbar {
      height: 64px;
      background: #0B1728;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
    }
    .left-nav-group { display: flex; align-items: center; gap: 16px; }
    .toggle-sidebar-btn {
      background: var(--bg-surface);
      border: 1px solid var(--border-primary);
      border-radius: 6px;
      padding: 6px 10px;
      cursor: pointer;
      color: var(--text-secondary);
      &:hover { background: var(--bg-surface-hover); color: #FFF; }
    }
    .breadcrumb-container { display: flex; align-items: center; gap: 8px; font-size: 13.5px; }
    .breadcrumb-system { font-weight: 500; color: var(--text-muted); }
    .breadcrumb-separator { color: var(--border-primary); }
    .breadcrumb-active { font-weight: 700; color: var(--text-platinum); }

    .right-nav-group { display: flex; align-items: center; gap: 16px; }
    .live-status-pill {
      display: flex;
      align-items: center;
      gap: 7px;
      background: var(--status-optimal-bg);
      color: var(--status-optimal-text);
      border: 1px solid var(--status-optimal-border);
      padding: 4px 12px;
      border-radius: var(--radius-pill);
      font-size: 12px;
      font-weight: 700;
    }
    .live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #34D399;
      box-shadow: 0 0 6px #34D399;
    }

    .signout-button {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-surface);
      border: 1px solid var(--border-primary);
      color: var(--text-secondary);
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: var(--transition-smooth);

      &:hover {
        background: var(--status-critical-bg);
        color: var(--status-critical-text);
        border-color: var(--status-critical-border);
      }
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      padding: 28px;
      background: var(--bg-app);
    }
  `]
})
export class AppComponent {
  isSidebarCollapsed = false;

  constructor(public auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
