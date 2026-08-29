import { ApiService } from './core/services/api.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ThemeService, ThemeOption } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-container">
      <!-- Mobile Backdrop Overlay -->
      <div class="mobile-sidebar-backdrop" *ngIf="isMobileDrawerOpen" (click)="closeMobileDrawer()"></div>

      <!-- Luxury Sidebar -->
      <aside class="sidebar" [class.collapsed]="isSidebarCollapsed" [class.mobile-open]="isMobileDrawerOpen" *ngIf="isWorkspaceRoute()">
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
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" (click)="closeMobileDrawer()" title="Dashboard">
            <span class="nav-icon">📊</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Dashboard</span>
          </a>
          <a routerLink="/daily-work" routerLinkActive="active" class="nav-item" (click)="closeMobileDrawer()" title="Daily Work">
            <span class="nav-icon">⚡</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Daily Work</span>
          </a>
          <a routerLink="/work-entries" routerLinkActive="active" class="nav-item" (click)="closeMobileDrawer()" title="All Work Entries">
            <span class="nav-icon">📋</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">All Entries</span>
          </a>
          <a routerLink="/work-items" routerLinkActive="active" class="nav-item" (click)="closeMobileDrawer()" title="Work Items Backlog">
            <span class="nav-icon">🎯</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Work Items</span>
          </a>
          <a routerLink="/calendar" routerLinkActive="active" class="nav-item" (click)="closeMobileDrawer()" title="Monthly Calendar">
            <span class="nav-icon">📅</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Calendar</span>
          </a>
          <a routerLink="/reports" routerLinkActive="active" class="nav-item" (click)="closeMobileDrawer()" title="Executive Reports">
            <span class="nav-icon">📑</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Reports & Matrix</span>
          </a>

          <div class="nav-section-title" *ngIf="!isSidebarCollapsed">MASTER DATA</div>
          <a routerLink="/meetings" routerLinkActive="active" class="nav-item" (click)="closeMobileDrawer()" title="Meetings">
            <span class="nav-icon">👥</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Meetings</span>
          </a>
          <a routerLink="/categories" routerLinkActive="active" class="nav-item" (click)="closeMobileDrawer()" title="Categories">
            <span class="nav-icon">🏷️</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Categories</span>
          </a>
          <a routerLink="/holidays" routerLinkActive="active" class="nav-item" (click)="closeMobileDrawer()" title="Holidays">
            <span class="nav-icon">🎉</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Holidays</span>
          </a>
          <a routerLink="/leaves" routerLinkActive="active" class="nav-item" (click)="closeMobileDrawer()" title="Leaves">
            <span class="nav-icon">🏖️</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Leaves</span>
          </a>

          <div class="system-nav-group" *ngIf="isAdmin()">
            <div class="nav-section-title" *ngIf="!isSidebarCollapsed">SYSTEM (ADMIN ONLY)</div>
            <a routerLink="/import" routerLinkActive="active" class="nav-item" (click)="closeMobileDrawer()" title="Excel Import">
              <span class="nav-icon">📥</span>
              <span class="nav-label" *ngIf="!isSidebarCollapsed">Excel Importer</span>
            </a>
            <a routerLink="/admin" routerLinkActive="active" class="nav-item" (click)="closeMobileDrawer()" title="Administration">
              <span class="nav-icon">⚙️</span>
              <span class="nav-label" *ngIf="!isSidebarCollapsed">Administration</span>
            </a>
            <a routerLink="/monitoring" routerLinkActive="active" class="nav-item" (click)="closeMobileDrawer()" title="API Monitoring & Observability">
              <span class="nav-icon">📡</span>
              <span class="nav-label" *ngIf="!isSidebarCollapsed">API Monitoring</span>
            </a>
          </div>
        </nav>

        <div class="sidebar-footer" *ngIf="!isSidebarCollapsed">
          <div class="user-profile-pill">
            <div class="user-avatar">
              {{ (currentUser?.username || 'AD').substring(0, 2).toUpperCase() }}
              <span class="status-indicator-dot"></span>
            </div>
            <div class="user-details">
              <span class="user-name">{{ currentUser?.fullName || 'Admin User' }}</span>
              <span class="user-role">{{ currentUser?.roles?.join(', ') || 'ADMIN' }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="main-wrapper">
        <header class="top-navbar" *ngIf="isWorkspaceRoute()">
          <div class="left-nav-group">
            <button class="toggle-sidebar-btn" (click)="toggleSidebar()" title="Toggle Navigation">
              <span class="icon-bar">☰</span>
            </button>
            <div class="breadcrumb-container">
              <span class="breadcrumb-system">DWPTS Operational Suite</span>
              <span class="breadcrumb-separator">/</span>
              <span class="breadcrumb-active">Executive Workspace</span>
            </div>
          </div>

          <div class="right-nav-group">
            <!-- Theme Customization Switcher Button -->
            <button class="theme-switcher-pill" (click)="openThemeModal()" title="Customize Theme">
              <span class="theme-swatch" [style.background]="activeThemeOption?.accentColor || '#D6B36A'"></span>
              <span>🎨 {{ activeThemeOption?.name || 'Theme' }}</span>
            </button>

            <div class="live-status-pill">
              <span class="live-dot"></span>
              <span>Synced</span>
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

      <!-- Luxury Theme Customization Modal -->
      <div class="theme-modal-backdrop" *ngIf="showThemeModal" (click)="onBackdropClick($event)">
        <div class="theme-modal-dialog">
          <div class="theme-modal-header">
            <div>
              <h3>🎨 Theme Customization</h3>
              <p class="theme-modal-sub">Select your tailored executive design language with instant preview</p>
            </div>
            <button class="theme-modal-close" (click)="closeThemeModal()">×</button>
          </div>

          <div class="theme-grid">
            <div class="theme-card-option" *ngFor="let t of themeService.themes" [class.selected]="t.id === themeService.currentTheme" (click)="selectTheme(t.id)">
              <div class="theme-preview-card" [style.background]="t.bgColor" [style.borderColor]="t.accentColor">
                <div class="preview-mini-header" [style.background]="t.surfaceColor">
                  <span class="mini-dot" [style.background]="t.accentColor"></span>
                  <span class="mini-title" [style.color]="t.textColor">{{ t.name }}</span>
                </div>
                <div class="preview-mini-body">
                  <div class="mini-swatch-row">
                    <span class="color-swatch-circle" [style.background]="t.accentColor" title="Primary Accent"></span>
                    <span class="color-swatch-circle" [style.background]="t.secondaryAccent" title="Secondary Accent"></span>
                    <span class="color-swatch-circle" [style.background]="t.surfaceColor" title="Surface Surface"></span>
                    <span class="color-swatch-circle" [style.background]="t.bgColor" title="Canvas Background"></span>
                  </div>
                </div>
              </div>

              <div class="theme-meta">
                <div class="theme-title-row">
                  <span class="theme-opt-name">{{ t.name }}</span>
                  <span class="theme-badge-tag" [style.color]="t.accentColor">{{ t.badge }}</span>
                </div>
                <span class="theme-opt-desc">{{ t.subtitle }}</span>
              </div>
            </div>
          </div>

          <div class="theme-modal-footer">
            <button class="btn btn-primary btn-pill" (click)="closeThemeModal()">Apply & Close</button>
          </div>
        </div>
      </div>
    </div>
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

    .sidebar {
      width: 260px;
      background: var(--bg-navy-deep);
      color: var(--text-primary);
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
      background: var(--bg-surface);
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
    .brand-title { font-size: 17px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }
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
        color: var(--text-primary);
      }

      &.active {
        background: rgba(214, 179, 106, 0.12);
        color: var(--text-primary);
        font-weight: 700;
        border: 1px solid var(--border-gold);

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
      background: var(--bg-surface);
    }
    .user-profile-pill { display: flex; align-items: center; gap: 12px; }
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
      border: 2px solid var(--bg-app);
      border-radius: 50%;
    }
    .user-details { display: flex; flex-direction: column; overflow: hidden; }
    .user-name { font-size: 13px; font-weight: 700; color: var(--text-primary); text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }
    .user-role { font-size: 10.5px; color: var(--gold-highlight); font-weight: 700; text-transform: uppercase; }

    .main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--bg-app);
    }

    .top-navbar {
      height: 64px;
      background: var(--bg-navy-deep);
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
      &:hover { background: var(--bg-surface-hover); color: var(--text-primary); }
    }
    .breadcrumb-container { display: flex; align-items: center; gap: 8px; font-size: 13.5px; }
    .breadcrumb-system { font-weight: 500; color: var(--text-muted); }
    .breadcrumb-separator { color: var(--border-primary); }
    .breadcrumb-active { font-weight: 700; color: var(--text-platinum); }

    .right-nav-group { display: flex; align-items: center; gap: 14px; }

    .theme-switcher-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-surface);
      border: 1px solid var(--border-gold);
      color: var(--text-platinum);
      padding: 6px 14px;
      border-radius: var(--radius-pill);
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
      transition: var(--transition-smooth);
      box-shadow: var(--gold-glow-subtle);

      &:hover {
        background: var(--bg-surface-hover);
        transform: translateY(-1px);
        box-shadow: var(--gold-glow);
      }
    }
    .theme-swatch {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      box-shadow: 0 0 6px rgba(0,0,0,0.5);
    }

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

    /* Theme Customization Modal */
    .theme-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(2, 8, 23, 0.85);
      backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.2s ease;
    }
    .theme-modal-dialog {
      background: var(--bg-surface);
      border: 1px solid var(--border-gold);
      border-radius: var(--radius-xl);
      width: 100%;
      max-width: 780px;
      padding: 32px;
      box-shadow: var(--shadow-modal);
    }
    .theme-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      h3 { font-size: 20px; font-weight: 800; color: var(--text-primary); }
    }
    .theme-modal-sub { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
    .theme-modal-close {
      background: transparent;
      border: none;
      font-size: 24px;
      color: var(--text-muted);
      cursor: pointer;
      &:hover { color: var(--text-primary); }
    }
    .theme-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .theme-card-option {
      border: 2px solid var(--border-primary);
      border-radius: var(--radius-lg);
      padding: 12px;
      cursor: pointer;
      background: var(--bg-navy-deep);
      transition: var(--transition-smooth);

      &:hover {
        transform: translateY(-2px);
        border-color: var(--gold-highlight);
        box-shadow: var(--shadow-card-hover);
      }

      &.selected {
        border-color: var(--gold-primary);
        background: var(--bg-surface-elevated);
        box-shadow: var(--gold-glow);
      }
    }
    .theme-preview-card {
      height: 72px;
      border-radius: 8px;
      border: 1px solid;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      margin-bottom: 10px;
    }
    .preview-mini-header {
      height: 22px;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 8px;
    }
    .mini-dot { width: 6px; height: 6px; border-radius: 50%; }
    .mini-title { font-size: 9.5px; font-weight: 700; }
    .preview-mini-body {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
    }
    .mini-swatch-row { display: flex; gap: 6px; }
    .color-swatch-circle { width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); }

    .theme-meta { display: flex; flex-direction: column; gap: 2px; }
    .theme-title-row { display: flex; justify-content: space-between; align-items: center; }
    .theme-opt-name { font-size: 13px; font-weight: 700; color: var(--text-primary); }
    .theme-badge-tag { font-size: 10.5px; font-weight: 800; }
    .theme-opt-desc { font-size: 11px; color: var(--text-muted); }

    .theme-modal-footer { display: flex; justify-content: flex-end; }


    /* Mobile Off-Canvas Drawer & Responsive Layout */
    .mobile-sidebar-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 998;
      animation: fadeIn 0.2s ease;
    }

    @media (max-width: 1024px) {
      .mobile-sidebar-backdrop {
        display: block;
      }

      .sidebar {
        position: fixed !important;
        left: 0;
        top: 0;
        bottom: 0;
        height: 100vh !important;
        width: 280px !important;
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        z-index: 999 !important;
        box-shadow: 10px 0 30px rgba(0, 0, 0, 0.7);
      }

      .sidebar.mobile-open {
        transform: translateX(0) !important;
      }

      .sidebar.collapsed {
        width: 280px !important;
        transform: translateX(-100%);
      }

      .sidebar.collapsed.mobile-open {
        transform: translateX(0) !important;
      }

      .top-navbar {
        padding: 0 14px !important;
      }

      .breadcrumb-system, .breadcrumb-separator {
        display: none !important;
      }

      .page-content {
        padding: 16px !important;
      }
    }

    @media (max-width: 640px) {
      .top-navbar {
        height: 56px !important;
      }

      .breadcrumb-container {
        font-size: 12px !important;
      }

      .theme-switcher-pill span:not(.theme-swatch) {
        display: none;
      }
      .theme-switcher-pill {
        padding: 6px 10px !important;
      }

      .live-status-pill {
        display: none !important;
      }

      .signout-button span:not(.signout-icon) {
        display: none;
      }
      .signout-button {
        padding: 6px 10px !important;
      }
    }

    @keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class AppComponent implements OnInit {
  isSidebarCollapsed = false;
  isMobileDrawerOpen = false;
  showThemeModal = false;
  currentUser: any = null;

  constructor(
    public auth: AuthService, 
    public themeService: ThemeService, 
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.auth.currentUser$.subscribe(u => {
      this.currentUser = u || {
        username: 'admin',
        fullName: 'Admin User',
        roles: ['ADMIN']
      };
      if (u) {
        this.api.syncWithCloud();
      }
    });

    this.api.syncWithCloud();
    setInterval(() => {
      this.api.syncWithCloud();
    }, 15000);
  }

  get activeThemeOption(): ThemeOption | undefined {
    return this.themeService.themes.find(t => t.id === this.themeService.currentTheme);
  }

  isAdmin(): boolean {
    if (!this.currentUser) return true;
    const roles: string[] = (this.currentUser.roles || []).map((r: string) => String(r).toUpperCase());
    const username = String(this.currentUser.username || '').toLowerCase();
    return roles.includes('ADMIN') || username.includes('admin');
  }

  isWorkspaceRoute(): boolean {
    return !this.router.url.includes('/login');
  }

  toggleSidebar() {
    if (window.innerWidth <= 1024) {
      this.isMobileDrawerOpen = !this.isMobileDrawerOpen;
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

  closeMobileDrawer() {
    if (window.innerWidth <= 1024) {
      this.isMobileDrawerOpen = false;
    }
  }

  openThemeModal() {
    this.showThemeModal = true;
  }

  closeThemeModal() {
    this.showThemeModal = false;
  }

  selectTheme(themeId: string) {
    this.themeService.setTheme(themeId);
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('theme-modal-backdrop')) {
      this.closeThemeModal();
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
